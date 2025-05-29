package main

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"graduation/desktop-app/version_control/service"
	"os"
	"path/filepath"
)

//func main() {
//	sourceFile := "test.txt"
//	backupDir := "idalbkdj"
//
//	if err := backupFile(sourceFile, backupDir); err != nil {
//		fmt.Printf("Backup failed: %v\n", err)
//		return
//	}
//	fmt.Println("Backup completed successfully")
//}

func Config() (*gorm.DB, error) {
	_, err := os.Stat("backup.db")
	if err != nil {
		_, err = os.Create("backup.db")
		if err != nil {
			return nil, err
		}
	}
	db, err := gorm.Open(sqlite.Open("backup.db"), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %v", err)
	}
	return db, nil
}

func main() {

	// List available backup versions
	backupDir := "C:\\Windows\\System32\\config\\systemprofile\\.filemonitor"
	fileId := "c6fefb8d-b77d-4ecd-9c0a-176387b4fcd1"
	versions, err := service.ListBackupVersions(backupDir, fileId)
	if err != nil {
		fmt.Printf("Failed to list backup versions: %v\n", err)
		return
	}

	if len(versions) == 0 {
		fmt.Println("No backup versions found")
		return
	}

	fmt.Println("Available backup versions:")
	for i, version := range versions {
		fmt.Printf("%d: %s\n", i+1, version)
	}

	err = os.MkdirAll(filepath.Join(backupDir, fileId, "restoration"), 0755)
	if err != nil {
		fmt.Printf("MkdirAll error: %v", err)
		return
	}

	// Example: Restore all version

	for _, version := range versions {
		dest := filepath.Join(backupDir, fileId, "restoration", fmt.Sprintf("%s.go", version))
		if err := service.RestoreFile(fileId, version, dest, backupDir); err != nil {
			fmt.Printf("Restore failed: %v\n", err)
			return
		}
	}
	fmt.Println("File restored successfully")
}

//func main() {
//	db, err := Config()
//	if err != nil {
//		panic(err)
//	}
//	db.AutoMigrate(model.FileInfos{}, model.Version{})
//	fileRepo := repository.NewFileInfoRepository(db)
//	fileService := service.NewFileService(fileRepo, "/Users/lamdt/GolandProjects/graduation/desktop-app/version_control")
//	fileService.StartMonitor()
//}
