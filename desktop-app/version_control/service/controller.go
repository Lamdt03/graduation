package service

import (
	"fmt"
	"graduation/desktop-app/version_control/common"
	"log"
	"time"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/debug"
	"golang.org/x/sys/windows/svc/mgr"
)

func RunService(isDebug bool, handler svc.Handler) error {
	if !isDebug {
		isInteractive, err := svc.IsWindowsService()
		log.Println("isInteractive=", isInteractive)
		if err != nil {
			log.Println("RunService failed,", err)
			return err
		}
		if isInteractive {
			// Real service context
			err = svc.Run(common.SERVICE_NAME, handler)
			if err != nil {
				log.Println("RunService failed,", err)
			}
		}
	}

	// Fallback to debug/interactive mode
	return debug.Run(common.SERVICE_NAME, handler)
}

func StopService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(common.SERVICE_NAME)
	if err != nil {
		return fmt.Errorf("could not access service: %w", err)
	}
	defer s.Close()

	status, err := s.Control(svc.Stop)
	if err != nil {
		return fmt.Errorf("failed to stop service: %w", err)
	}

	// Wait a bit for the service to stop
	timeout := time.Now().Add(10 * time.Second)
	for status.State != svc.Stopped {
		if time.Now().After(timeout) {
			return fmt.Errorf("timeout waiting for service to stop")
		}
		time.Sleep(300 * time.Millisecond)
		status, err = s.Query()
		if err != nil {
			return fmt.Errorf("error querying service status: %w", err)
		}
	}

	return nil
}

func StartService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(common.SERVICE_NAME)
	if err != nil {
		return fmt.Errorf("could not access service: %w", err)
	}
	defer s.Close()

	return s.Start()
}

func InstallService(monitorPath string) error {
	execPath := "C:\\Users\\lamdt\\GolandProjects\\graduation\\desktop-app\\build\\bin\\file-monitor.exe" // Replace with the actual path to your executable
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(common.SERVICE_NAME)
	if err == nil {
		s.Close()
		return fmt.Errorf("service %s already exists", common.SERVICE_NAME)
	}

	binaryPath := fmt.Sprintf("\"%s\" service --path \"%s\"", execPath, monitorPath)

	s, err = m.CreateService(common.SERVICE_NAME, binaryPath, mgr.Config{
		DisplayName: common.SERVICE_NAME,
		StartType:   mgr.StartAutomatic,
	})

	if err != nil {
		return fmt.Errorf("could not create service: %w", err)
	}
	defer s.Close()

	return nil
}

func UninstallService() error {
	m, err := mgr.Connect()
	if err != nil {
		return fmt.Errorf("failed to connect to service manager: %w", err)
	}
	defer m.Disconnect()

	s, err := m.OpenService(common.SERVICE_NAME)
	if err != nil {
		return fmt.Errorf("could not access service: %w", err)
	}
	defer s.Close()

	if err := s.Delete(); err != nil {
		return fmt.Errorf("could not delete service: %w", err)
	}

	return nil
}
