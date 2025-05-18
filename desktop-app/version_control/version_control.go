package main

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"graduation/desktop-app/version_control/service"
	"os"
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

	sourceFile := "837c96ed-c928-4e43-8bcb-6f13a1e3087e"
	backupDir := "/Users/lamdt/GolandProjects/graduation/837c96ed-c928-4e43-8bcb-6f13a1e3087e"

	// List available backup versions
	versions, err := service.ListBackupVersions(sourceFile, backupDir)
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

	// Example: Restore to the latest version
	if err := service.RestoreFile(sourceFile, backupDir, versions[1]); err != nil {
		fmt.Printf("Restore failed: %v\n", err)
		return
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
