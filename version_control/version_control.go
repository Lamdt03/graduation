package main

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"git.cystack.org/endpoint/dlp/file_monitor"
	"graduation/version_control/model"
	"graduation/version_control/repository"
	"io"
	"os"
	"path/filepath"
	"strconv"
)

const blockSize = 4096

type BlockHash struct {
	Offset int64  `json:"offset"`
	Hash   string `json:"hash"`
}

type ChangedBlock struct {
	Offset  int64  `json:"offset"`
	Hash    string `json:"hash"`
	Content string `json:"content"`
}

type VersioningService struct {
	fiRepo      *repository.FileInfoRepository
	MonitorPath string
	HomePath    string
}

func (v *VersioningService) StartMonitor() {
	fileMonitor, numCon, err := file_monitor.GetMonitor(v.MonitorPath)
	fmt.Print(numCon)
	if err != nil {

	}
	go func() {
		for {
			select {
			case inf := <-fileMonitor.InfoChan:
				if filepath.Ext(inf.Path) == "" {
					continue
				}
				switch inf.Transition {
				case "CREATE":
					{
						err = v.HandleCreateAction(inf.Path)
					}
				case "RENAME":
					{
						err = v.HandleMoveAction(inf.OldPath, inf.Path)

					}
				case "MOVE":
					{
						err = v.HandleMoveAction(inf.OldPath, inf.Path)

					}

				case "DELETE":
					{
						err = v.HandleDeleteAction(inf.Path)
					}
				case "WRITE":
					{
						err = v.HandleWriteAction(inf.Path)
					}
				}
				if err != nil {
					fmt.Println(err)
				}

			}

		}
	}()
	fileMonitor.StartMonitor()
}

func hashBlock(data []byte) string {
	h := md5.Sum(data)
	return fmt.Sprintf("%x", h[:])
}

func scanFileBlocks(filePath string) ([]BlockHash, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var blocks []BlockHash
	buf := make([]byte, blockSize)
	var offset int64 = 0

	for {
		n, err := f.Read(buf)
		if n > 0 {
			hash := hashBlock(buf[:n])
			blocks = append(blocks, BlockHash{Offset: offset, Hash: hash})
			offset += int64(n)
		}
		if err == io.EOF {
			break
		} else if err != nil {
			return nil, err
		}
	}
	return blocks, nil
}

func saveHashes(hashes []BlockHash, path string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	encoder := json.NewEncoder(f)
	encoder.SetIndent("", "  ")
	return encoder.Encode(hashes)
}

func loadHashes(path string) ([]BlockHash, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var hashes []BlockHash
	err = json.NewDecoder(f).Decode(&hashes)
	return hashes, err
}

func saveChangedBlocks(filePath string, oldHashes []BlockHash, outputPath string) error {
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	var changedBlocks []ChangedBlock
	buf := make([]byte, blockSize)
	i := 0
	var offset int64 = 0

	for {
		n, err := f.Read(buf)
		if n <= 0 {
			break
		}

		blockData := buf[:n]
		newHash := hashBlock(blockData)
		if i >= len(oldHashes) || oldHashes[i].Hash != newHash {
			encoded := base64.StdEncoding.EncodeToString(blockData)
			changedBlocks = append(changedBlocks, ChangedBlock{
				Offset:  offset,
				Hash:    newHash,
				Content: encoded,
			})
		}

		offset += int64(n)
		i++

		if err == io.EOF {
			break
		} else if err != nil {
			return err
		}
	}

	outFile, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer outFile.Close()

	encoder := json.NewEncoder(outFile)
	encoder.SetIndent("", "  ")
	return encoder.Encode(changedBlocks)
}

func restoreFile(jsonPath, outputFilePath string) error {
	// Mở và đọc file JSON chứa các block thay đổi
	f, err := os.Open(jsonPath)
	if err != nil {
		return err
	}
	defer f.Close()

	var blocks []ChangedBlock
	if err := json.NewDecoder(f).Decode(&blocks); err != nil {
		return err
	}

	// Tạo (hoặc mở) file đích để ghi dữ liệu
	outFile, err := os.OpenFile(outputFilePath, os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer outFile.Close()

	// Ghi từng block vào vị trí offset tương ứng
	for _, block := range blocks {
		data, err := base64.StdEncoding.DecodeString(block.Content)
		if err != nil {
			return fmt.Errorf("decode error at offset %d: %w", block.Offset, err)
		}
		if _, err := outFile.WriteAt(data, block.Offset); err != nil {
			return fmt.Errorf("write error at offset %d: %w", block.Offset, err)
		}
	}

	return nil
}

func (v *VersioningService) HandleMoveAction(oldPath string, newPath string) error {
	err := v.fiRepo.UpdateFileInfo(oldPath, newPath)
	if err != nil {
		return fmt.Errorf("UpdateFileInfo error: %v", err)
	}
	return nil
}

func (v *VersioningService) HandleCreateAction(filepath string) error {
	fi := model.NewFileInfo(filepath)
	err := v.fiRepo.CreateFileInfo(fi)
	if err != nil {
		return fmt.Errorf("CreateFileInfo error: %v", err)
	}
	return nil
}

func (v *VersioningService) HandleDeleteAction(filepath string) error {
	err := v.fiRepo.DeleteFileInfo(filepath)
	if err != nil {
		return fmt.Errorf("DeleteFileInfo error: %v", err)
	}

	return nil
}

func (v *VersioningService) HandleWriteAction(path, timestamp string) error {
	blocks, err := scanFileBlocks(path)
	if err != nil {
		return fmt.Errorf("ScanFileBlocks error: %v", err)
	}
	fi, err := v.fiRepo.GetFileInfo(path)
	if err != nil {
		return fmt.Errorf("GetFileInfo error: %v", err)
	}
	versionPath := filepath.Join(v.HomePath, fi.ID, timestamp)
	for _, block := range blocks {
		blockPath := filepath.Join(versionPath, strconv.Itoa(int(block.Offset)))
	}
}

func main() {
	mode := flag.String("mode", "", "backup or restore")
	filePath := flag.String("file", "", "File to backup (for backup mode)")
	metaPath := flag.String("meta", "", "Path to metadata file (for backup mode)")
	deltaDir := flag.String("out", "", "Output dir for delta blocks or restored file path")
	fullPath := flag.String("full", "", "Full file path (for restore mode)")
	flag.Parse()

	switch *mode {
	case "backup":
		if *filePath == "" || *metaPath == "" || *deltaDir == "" {
			fmt.Println("Missing arguments for backup mode")
			return
		}

		// Nếu chưa có hash, tạo mới
		if _, err := os.Stat(*metaPath); os.IsNotExist(err) {
			blocks, _ := scanFileBlocks(*filePath)
			saveHashes(blocks, *metaPath)
			fmt.Println("Initial hash saved.")
			return
		}

		oldHashes, _ := loadHashes(*metaPath)
		saveChangedBlocks(*filePath, oldHashes, *deltaDir)
		newHashes, _ := scanFileBlocks(*filePath)
		saveHashes(newHashes, *metaPath)
		fmt.Println("Backup delta completed.")

	case "restore":
		if *fullPath == "" || *deltaDir == "" || *filePath == "" {
			fmt.Println("Missing arguments for restore mode")
			return
		}

		if err := restoreFile(*fullPath, *deltaDir, *filePath); err != nil {
			fmt.Println("Restore failed:", err)
		} else {
			fmt.Println("Restore completed:", *filePath)
		}

	default:
		fmt.Println("Unknown mode. Use -mode=backup or -mode=restore")
	}
}
