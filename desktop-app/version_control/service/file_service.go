package service

import (
	"code.sajari.com/docconv/v2"
	"encoding/json"
	"errors"
	"fmt"
	"git.cystack.org/endpoint/dlp/file_monitor"
	"github.com/rs/zerolog/log"
	"graduation/desktop-app/version_control/model"
	"graduation/desktop-app/version_control/repository"
	"strings"

	"io"
	"os"
	"path/filepath"
	"sort"
	"time"
)

type FileService struct {
	fiRepo      *repository.FileInfoRepository
	MonitorPath string
	BackupDir   string
}

func NewFileService(fiRepo *repository.FileInfoRepository, monitorPath, backupDir string) *FileService {
	return &FileService{
		fiRepo:      fiRepo,
		MonitorPath: monitorPath,
		BackupDir:   backupDir,
	}
}

func (f *FileService) StartMonitor() {
	fileMonitor, numCon, err := file_monitor.GetMonitor(f.MonitorPath)
	fmt.Print(numCon)
	if err != nil {

	}
	go func() {
		valiExcelExt := map[string]bool{
			".csv":  true,
			".xlsx": true,
			".xls":  true,
		}

		for {
			select {
			case inf := <-fileMonitor.InfoChan:
				if filepath.Ext(inf.Path) == "" {
					continue
				}
				log.Info().Msgf("new event: %s", inf.Path)
				if !valiExcelExt[filepath.Ext(inf.Path)] {
					if strings.HasPrefix(filepath.Base(inf.Path), "~") || strings.HasPrefix(filepath.Base(inf.Path), "$") {
						continue
					}
					mimeType := docconv.MimeTypeByExtension(filepath.Base(inf.Path))
					if mimeType == "application/octet-stream" {
						continue
					}
				}
				backupLog := model.EventLog{
					Path:      inf.Path,
					Event:     inf.Transition,
					Timestamp: time.Now().Format("2006-01-02"),
				}
				if model.BackupLogsList.Len() == 100 {
					model.BackupLogsList.Remove(model.BackupLogsList.Front())
				}
				model.BackupLogsList.PushBack(backupLog)
				switch inf.Transition {
				case "CREATE":
					{
						err = f.HandleCreateAction(inf.Path)
						if err != nil {
							fmt.Print(err)
						}
						if inf.Size != 0 {
							err = f.HandleWriteAction(inf.Path)
						}

					}
				case "RENAME":
					{
						err = f.HandleMoveAction(inf.OldPath, inf.Path)

					}
				case "MOVE":
					{
						err = f.HandleMoveAction(inf.OldPath, inf.Path)

					}

				case "DELETE":
					{
						err = f.HandleDeleteAction(inf.Path)
					}
				case "WRITE":
					{
						err = f.HandleWriteAction(inf.Path)
					}
				}
				if err != nil {
					log.Err(err).Msg("action file failed")
				}
			case err = <-fileMonitor.ErrChan:
				{
					log.Err(err).Msg("monitor failed")
				}
			}

		}
	}()
	fileMonitor.StartMonitor()

}

func (f *FileService) HandleMoveAction(oldPath string, newPath string) error {
	err := f.fiRepo.UpdateFileInfo(oldPath, newPath)
	if err != nil {
		return fmt.Errorf("UpdateFileInfo error: %v", err)
	}
	return nil
}

func (f *FileService) HandleCreateAction(filepath string) error {
	_, err := f.fiRepo.GetFileInfo(filepath)
	if err != nil {
		if errors.Is(err, repository.FileNotFoundErrorCode) {
			newFi := model.NewFileInfo(filepath)
			err = f.fiRepo.CreateFileInfo(newFi)
			if err != nil {
				return fmt.Errorf("CreateFileInfo error: %v", err)
			}
		} else {
			return fmt.Errorf("GetFileInfo error: %v", err)
		}
	}
	return nil
}

func (f *FileService) HandleDeleteAction(filepath string) error {
	err := f.fiRepo.DeleteFileInfo(filepath)
	if err != nil {
		return fmt.Errorf("DeleteFileInfo error: %v", err)
	}

	return nil
}

func (f *FileService) HandleWriteAction(sourceFile string) error {
	fi, err := f.fiRepo.CreateFileIfNotExist(sourceFile)
	if err != nil {
		return fmt.Errorf("CreateFileIfNotExist error: %v", err)
	}
	dirPath := filepath.Join(f.BackupDir, fi.ID)
	if err := backupFile(sourceFile, dirPath); err != nil {
		fmt.Printf("Backup failed: %v\n", err)
		return err
	}
	return nil
}

func (f *FileService) ListVersion(path string) ([]string, error) {
	fi, err := f.fiRepo.GetFileInfo(path)
	if err != nil {
		return nil, fmt.Errorf("GetFileInfo error: %v", err)
	}
	versions, err := ListBackupVersions(f.BackupDir, fi.ID)
	if err != nil {
		return nil, fmt.Errorf(fmt.Sprintf("Failed to list backup versions: %v", err))
	}
	return versions, nil
}

func (f *FileService) RestoreAll(path string) (string, error) {
	fi, err := f.fiRepo.GetFileInfo(path)
	if err != nil {
		return "", fmt.Errorf("GetFileInfo error: %v", err)
	}
	versions, err := ListBackupVersions(f.BackupDir, fi.ID)
	if err != nil {
		return "", fmt.Errorf("Failed to list backup versions: %v", err)
	}
	if len(versions) == 0 {
		return "", fmt.Errorf("no backup versions found")
	}

	fmt.Println("Available backup versions:")
	for i, version := range versions {
		log.Info().Msgf("%d: %s\n", i+1, version)
	}
	restoreDir := filepath.Join(f.BackupDir, fi.ID, "restoration")
	err = os.MkdirAll(restoreDir, 0755)
	if err != nil {
		return "", fmt.Errorf("MkdirAll error: %v", err)
	}
	for _, version := range versions {
		dest := filepath.Join(f.BackupDir, fi.ID, "restoration", fmt.Sprintf("%s.%s", version, filepath.Ext(path)))
		if err := RestoreFile(fi.ID, version, dest, f.BackupDir); err != nil {
			return "", fmt.Errorf("Restore failed: %v\n", err)
		}
	}
	return restoreDir, nil
}

func (f *FileService) RestoreVersion(filePath, timestamp string) error {
	fi, err := f.fiRepo.GetFileInfo(filePath)
	if err != nil {
		return fmt.Errorf("GetFileInfo error: %v", err)
	}
	err = os.MkdirAll(filepath.Join(f.BackupDir, fi.ID, "restoration"), 0755)
	if err != nil {
		return fmt.Errorf("MkdirAll error: %v", err)
	}

	dest := filepath.Join(f.BackupDir, fi.ID, "restoration", fmt.Sprintf("%s%s", timestamp, filepath.Ext(filePath)))
	err = RestoreFile(fi.ID, timestamp, dest, f.BackupDir)
	if err != nil {
		return fmt.Errorf("RestoreFile error: %v", err)
	}
	return nil
}

const blockSize = 4096 // 4KB blocks

type Block struct {
	Offset  int    `json:"offset"`
	Content []byte `json:"content"`
}

func backupFile(sourcePath, backupDir string) error {
	// Create backup directory if it doesn't exist
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return fmt.Errorf("failed to create backup directory: %v", err)
	}

	// Open source file
	sourceFile, err := os.Open(sourcePath)
	if err != nil {
		return fmt.Errorf("failed to open source file: %v", err)
	}
	defer sourceFile.Close()

	// Get file info
	_, err = sourceFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to get file info: %v", err)
	}

	// Generate backup filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	backupFilename := fmt.Sprintf("%s.json", timestamp)
	backupPath := filepath.Join(backupDir, backupFilename)

	// Get previous backup for differential comparison
	previousBackup := getPreviousBackup(sourcePath, backupDir)

	// Create backup file
	backupFile, err := os.Create(backupPath)
	if err != nil {
		return fmt.Errorf("failed to create backup file: %v", err)
	}
	defer backupFile.Close()

	// Initialize JSON encoder
	enc := json.NewEncoder(backupFile)
	enc.SetIndent("", "  ")

	// Read and process file in blocks
	buffer := make([]byte, blockSize)
	var offset int
	blocks := []Block{}

	for {
		n, err := sourceFile.Read(buffer)
		if err != nil && err != io.EOF {
			return fmt.Errorf("failed to read source file: %v", err)
		}
		if n == 0 {
			break
		}

		// For differential backup, compare with previous backup
		if shouldBackupBlock(previousBackup, offset, buffer[:n]) {
			block := Block{
				Offset:  offset,
				Content: make([]byte, n),
			}
			copy(block.Content, buffer[:n])
			blocks = append(blocks, block)
		}

		offset += n
	}

	// Write blocks to JSON file
	if err := enc.Encode(blocks); err != nil {
		return fmt.Errorf("failed to write backup data: %v", err)
	}

	return nil
}

func getPreviousBackup(sourcePath, backupDir string) []Block {
	// Find the most recent backup file
	var latestBackup string
	var latestTime time.Time

	pattern := fmt.Sprintf("%s_*.json", filepath.Base(sourcePath))
	matches, _ := filepath.Glob(filepath.Join(backupDir, pattern))

	for _, match := range matches {
		// Extract timestamp from filename
		filename := filepath.Base(match)
		timeStr := filename[len(filepath.Base(sourcePath))+1 : len(filename)-5]
		t, err := time.Parse("20060102_150405", timeStr)
		if err != nil {
			continue
		}
		if t.After(latestTime) {
			latestTime = t
			latestBackup = match
		}
	}

	if latestBackup == "" {
		return nil
	}

	// Read previous backup
	file, err := os.Open(latestBackup)
	if err != nil {
		return nil
	}
	defer file.Close()

	var blocks []Block
	if err := json.NewDecoder(file).Decode(&blocks); err != nil {
		return nil
	}

	return blocks
}

func shouldBackupBlock(previousBlocks []Block, offset int, currentContent []byte) bool {
	if len(previousBlocks) == 0 {
		return true // No previous backup, backup everything
	}

	// Find matching block in previous backup
	for _, block := range previousBlocks {
		if block.Offset == offset {
			// Compare content
			if len(block.Content) != len(currentContent) {
				return true
			}
			for i := range block.Content {
				if block.Content[i] != currentContent[i] {
					return true
				}
			}
			return false // Block unchanged
		}
	}

	return true // New block
}

// RestoreFile restores a file to a specific backup version identified by timestamp
func RestoreFile(fileId, timestamp, dest, backupDir string) error {
	// Construct the backup file path
	backupFilename := fmt.Sprintf("%s.json", timestamp)
	backupPath := filepath.Join(backupDir, fileId, backupFilename)

	// Open the backup file
	backupFile, err := os.Open(backupPath)
	if err != nil {
		return fmt.Errorf("failed to open backup file: %v", err)
	}
	defer backupFile.Close()

	// Decode JSON backup data
	var blocks []Block
	if err := json.NewDecoder(backupFile).Decode(&blocks); err != nil {
		return fmt.Errorf("failed to decode backup data: %v", err)
	}

	// Create or open the destination file for restoration
	destFile, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("failed to create destination file: %v", err)
	}
	defer destFile.Close()

	// Sort blocks by offset to ensure correct order
	sort.Slice(blocks, func(i, j int) bool {
		return blocks[i].Offset < blocks[j].Offset
	})

	// Restore each block
	for _, block := range blocks {
		// Seek to the correct offset
		if _, err := destFile.Seek(int64(block.Offset), 0); err != nil {
			return fmt.Errorf("failed to seek to offset %d: %v", block.Offset, err)
		}

		// Write block content
		if _, err := destFile.Write(block.Content); err != nil {
			return fmt.Errorf("failed to write block at offset %d: %v", block.Offset, err)
		}
	}

	return nil
}

// ListBackupVersions returns a sorted list of available backup timestamps for a file
func ListBackupVersions(backupDir, fileId string) ([]string, error) {
	dir := filepath.Join(backupDir, fileId)
	var timestamps []string
	pattern := fmt.Sprintf("*.json")
	matches, err := filepath.Glob(filepath.Join(dir, pattern))
	if err != nil {
		return nil, fmt.Errorf("failed to list backup files: %v", err)
	}

	for _, match := range matches {
		filename := filepath.Base(match)
		// Extract timestamp from filename
		timeStr := strings.TrimSuffix(filename, ".json")
		if _, err := time.Parse("20060102_150405", timeStr); err == nil {
			timestamps = append(timestamps, timeStr)
		}
	}

	// Sort timestamps in descending order (newest first)
	sort.Slice(timestamps, func(i, j int) bool {
		return timestamps[i] > timestamps[j]
	})

	return timestamps, nil
}
