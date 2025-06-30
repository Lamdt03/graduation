package main

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows"
	"graduation/desktop-app/update"
	"os"
	"os/exec"
	"unsafe"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	signalChan := make(chan bool, 1)
	isUpdateChan := make(chan bool, 1)
	a.ctx = ctx
	go func() {
		select {
		case <-signalChan:
			{
				result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
					Type:          runtime.QuestionDialog,
					Title:         "A new version of file-monitor is available",
					Message:       "Would you like to install it now? We'll reopen windows for you",
					DefaultButton: "Yes",
				})

				if err != nil {
					isUpdateChan <- false
					return
				}
				if result == "Yes" {
					isUpdateChan <- true
					return
				} else {
					isUpdateChan <- false
					return
				}
			}
		}
	}()
	update.AutoUpdate(signalChan, isUpdateChan)
}

var ErrNotElevated = fmt.Errorf("not running as administrator")

type TokenElevation struct {
	TokenIsElevated uint32
}

func isElevated() bool {
	var token windows.Token
	// Lấy token của tiến trình hiện tại
	err := windows.OpenProcessToken(windows.CurrentProcess(), windows.TOKEN_QUERY, &token)
	if err != nil {
		return false
	}
	defer token.Close()

	var elevation TokenElevation
	var outLen uint32

	// Lấy thông tin TokenElevation
	err = windows.GetTokenInformation(
		token,
		windows.TokenElevation,
		(*byte)(unsafe.Pointer(&elevation)),
		uint32(unsafe.Sizeof(elevation)),
		&outLen,
	)
	if err != nil {
		return false
	}

	return elevation.TokenIsElevated != 0
}

func (a *App) InstallService(path string) error {
	if !isElevated() {
		return ErrNotElevated
	}

	binaryPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("could not get executable path: %w", err)
	}
	cmd := exec.Command(binaryPath, "install", "--path", path)
	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("could not install service: %w", err)
	}
	return nil
}

func (a *App) OpenFolderDialog() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Folder to open",
	})
}

func (a *App) OpenFileDialog() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File to open",
	})
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
