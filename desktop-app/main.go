package main

import (
	"embed"
	"fmt"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v2"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/debug"
	"gopkg.in/natefinch/lumberjack.v2"
	"graduation/desktop-app/controller"
	"graduation/desktop-app/update"
	"graduation/desktop-app/version_control/common"
	"graduation/desktop-app/version_control/service"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"
)

//go:embed all:frontend/dist
var frontend embed.FS

func main() {
	// Define the CLI application
	var logFile io.Writer
	logf := filepath.Join("C:\\file-monitor.log")
	logFile = &lumberjack.Logger{
		Filename:   logf,
		MaxSize:    25, // megabytes
		MaxBackups: 3,
		MaxAge:     28, // days
	}
	if runtime.GOOS == "windows" {
		// On Windows, Orbit runs as a "Windows Service", which fails to write to os.Stderr with
		// "write /dev/stderr: The handle is invalid" (see #3100). Thus, we log to the logFile only.
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: logFile, TimeFormat: time.RFC3339Nano, NoColor: true})
	} else {
		log.Logger = log.Output(zerolog.MultiLevelWriter(
			zerolog.ConsoleWriter{Out: logFile, TimeFormat: time.RFC3339Nano, NoColor: true},
			zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339Nano, NoColor: true},
		))
	}
	app := &cli.App{
		Name:  "desktop-app",
		Usage: "A desktop application with file monitoring service",
		Commands: []*cli.Command{
			{
				Name:  "gui",
				Usage: "Run the GUI application",
				Action: func(c *cli.Context) error {
					return runGUI()
				},
			},
			{
				Name:  "service",
				Usage: "Run the file monitoring service",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "path",
						Usage:   "Path to monitor for file changes",
						Value:   "C:\\path\\to\\monitor", // Replace with your default path
						Aliases: []string{"p"},
					},
					&cli.BoolFlag{
						Name:    "debug",
						Usage:   "Run service in debug mode (console output)",
						Aliases: []string{"d"},
					},
				},
				Action: func(c *cli.Context) error {
					return runService(c.String("path"), c.Bool("debug"))
				},
			},
			{
				Name:  "install",
				Usage: "Install the file monitoring service",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "path",
						Usage:   "Path to monitor for file changes",
						Value:   "C:\\path\\to\\monitor", // Replace with your default path
						Aliases: []string{"p"},
					},
				},
				Action: func(c *cli.Context) error {
					err := service.InstallService(c.String("path"))
					if err != nil {
						return err
					}
					binaryPath, err := os.Executable()
					binPath := fmt.Sprintf("\"%s\" service --path \"%s\"", binaryPath, c.String("path"))

					configCmd := exec.Command("sc", "config", common.SERVICE_NAME, fmt.Sprintf(`binPath=%s`, binPath))
					configOutput, err := configCmd.CombinedOutput()
					if err != nil {
						log.Error().Err(err).Msgf("Error running config %s", string(configOutput))
						return err
					}
					log.Info().Msgf("config success %s", string(configOutput))

					startCmd := exec.Command("sc", "start", common.SERVICE_NAME)
					startOutput, err := startCmd.CombinedOutput()
					if err != nil {
						log.Error().Err(err).Msgf("start service fail %s", string(startOutput))
						return err
					}
					log.Info().Msgf("start service success %s", string(startOutput))
					return nil
				},
			},
			{
				Name:  "remove",
				Usage: "Remove the file monitoring service",
				Action: func(c *cli.Context) error {
					return service.UninstallService()
				},
			},
		},
		// Default action if no command is specified
		Action: func(c *cli.Context) error {
			return runGUI()
		},
	}

	// Run the CLI application
	if len(os.Args) == 0 {
		runGUI()
	}
	err := app.Run(os.Args)
	if err != nil {
		log.Err(err).Msg("run failed")
	}
}

// runGUI starts the Wails GUI application
func runGUI() error {
	update.AutoUpdate()
	app := NewApp()
	fullTextSearchController := &controller.SearchController{}

	return wails.Run(&options.App{
		Title:  "desktop-app",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: frontend,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			fullTextSearchController,
		},
	})
}

// runService starts the file monitoring service
func runService(monitorPath string, isDebug bool) error {
	handler := &service.FileMonitorService{
		MonitorPath: monitorPath,
	}

	if !isDebug {
		isInteractive, err := svc.IsWindowsService()
		log.Info().Msgf("isInteractive %v", isInteractive)
		if err != nil {
			log.Err(err).Msg("RunService failed")
			return err
		}
		if isInteractive {
			// Real service context
			err = svc.Run(common.SERVICE_NAME, handler)
			if err != nil {
				log.Err(err).Msg("RunService failed")
			}
		}
	}

	// Fallback to debug/interactive mode
	return debug.Run(common.SERVICE_NAME, handler)
}
