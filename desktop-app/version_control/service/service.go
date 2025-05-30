package service

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"golang.org/x/sys/windows/svc"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"graduation/desktop-app/controller"
	"graduation/desktop-app/version_control/model"
	"graduation/desktop-app/version_control/repository"
	"net/http"

	"os"
	"path/filepath"
)

type FileMonitorService struct {
	MonitorPath string
	exit        chan struct{}
}

func (f *FileMonitorService) run() {
	// Lấy đường dẫn thư mục home
	homeDir, err := os.UserHomeDir()
	log.Info().Msgf("monitor path: %s", homeDir)
	if err != nil {
		log.Err(err).Msg("could not get home directory")
	}

	// Tạo đường dẫn tới thư mục .filemonitor
	dirPath := filepath.Join(homeDir, ".filemonitor")
	// Kiểm tra và tạo thư mục nếu không tồn tại
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		err = os.MkdirAll(dirPath, 0755)
		if err != nil {
			log.Err(err).Msgf("could not create directory %s", dirPath)
		}
	} else if err != nil {
		log.Err(err).Msgf("error checking directory %s", dirPath)
	}

	// Tạo đường dẫn tới file backup.db
	dbPath := filepath.Join(dirPath, "backup.db")
	// Kiểm tra và tạo file nếu không tồn tại
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		// Tạo file rỗng
		file, err := os.Create(dbPath)
		if err != nil {
			log.Err(err).Msgf("could not create file %s", dbPath)
		}
		file.Close()
	} else if err != nil {
		log.Err(err).Msgf("error checking file %s", dbPath)
	}

	// Mở kết nối tới database
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Err(err).Msgf("could not open database %s", dbPath)
	}
	db.AutoMigrate(model.FileInfos{})
	fileRepo := repository.NewFileInfoRepository(db)
	fileMonitor := NewFileService(fileRepo, f.MonitorPath, dirPath)
	fileMonitor.StartMonitor()

	//open port to restore file
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/file/versions", func(ctx *gin.Context) {
		path := ctx.Query("filepath")
		target := ctx.Query("target")
		restoreDir, err := fileMonitor.RestoreAll(path)
		if err != nil {
			log.Err(err).Msgf("could not restore file %s", path)
		}
		fullTextSearchController := controller.SearchController{}
		locations, err := fullTextSearchController.SearchFullText(restoreDir, target)
		if err != nil {
			log.Err(err).Msgf("could not search file %s", path)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, locations)
	})
	go func() {
		err := router.Run("127.0.0.1:9999")
		if err != nil {
			log.Err(err).Msgf("could not start service")
		}
	}()
	<-f.exit
}

func (f *FileMonitorService) Execute(args []string, r <-chan svc.ChangeRequest, s chan<- svc.Status) (bool, uint32) {
	// Tell Windows the service is starting
	s <- svc.Status{State: svc.StartPending}

	// Set up resources (e.g. open log file, config, etc.)
	f.exit = make(chan struct{})
	// Tell Windows the service is now running
	s <- svc.Status{
		State:   svc.Running,
		Accepts: svc.AcceptStop | svc.AcceptShutdown | svc.AcceptPauseAndContinue,
	}

	go f.run()

	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				s <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				log.Info().Msg("Service stopping...")
				// Tell SCM we're stopping
				s <- svc.Status{State: svc.StopPending}
				// Clean up resources
				close(f.exit)
				return false, 0
			case svc.Pause:
				log.Info().Msg("Service paused")
				s <- svc.Status{State: svc.Paused, Accepts: svc.AcceptStop | svc.AcceptShutdown | svc.AcceptPauseAndContinue}
			case svc.Continue:
				log.Info().Msg("Service continued")
				s <- svc.Status{State: svc.Running, Accepts: svc.AcceptStop | svc.AcceptShutdown | svc.AcceptPauseAndContinue}
			default:
				log.Printf("Unexpected control request #%d", c)
			}
		}
	}
}
