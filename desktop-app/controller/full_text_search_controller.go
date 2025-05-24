package controller

import (
	"bufio"
	"code.sajari.com/docconv/v2"
	"fmt"
	"github.com/blevesearch/bleve/v2"

	"github.com/xuri/excelize/v2"
	"os"
	"path/filepath"
	"strings"
)

const indexPath = "search.bleve"

type Location struct {
	Col int `json:"col"`
	Row int `json:"row"`
}

type LocationsFile struct {
	Locations []Location `json:"locations"`
	Filename  string     `json:"filename"`
}

type SearchController struct {
}

func (s *SearchController) SearchFullText(folderPath, searchTerm string) ([]LocationsFile, error) {
	err := os.RemoveAll(indexPath)
	if err != nil {
		return nil, fmt.Errorf("remove folder failed: %v", err)
	}

	mapping := bleve.NewIndexMapping()
	index, err := bleve.New(indexPath, mapping)
	defer index.Close()
	if err != nil {
		return nil, fmt.Errorf("Failed to create index: %v", err)
	}

	err = filepath.WalkDir(folderPath, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Skip hidden or ignored directories
		skipDirs := map[string]bool{
			".git":         true,
			"node_modules": true,
			"venv":         true,
			".idea":        true,
		}

		if d.IsDir() {
			base := filepath.Base(path)
			if skipDirs[base] {
				return filepath.SkipDir
			}
			return nil
		} else {
			ext := filepath.Ext(path)
			if ext != fileExtension {
				return nil
			}
		}

		// Only process files
		content, err := extractContent(path)
		if err != nil || len(strings.TrimSpace(content)) == 0 {
			return nil
		}
		doc := map[string]string{
			"path":    path,
			"content": content,
		}
		return index.Index(path, doc)
	})

	if err != nil {
		return nil, fmt.Errorf("Indexing failed: %v", err)
	}

	// Search
	query := bleve.NewMatchQuery(searchTerm)
	search := bleve.NewSearchRequest(query)
	result, err := index.Search(search)

	if err != nil {
		return nil, fmt.Errorf("Search failed: %v", err)
	}
	var locationFiles []LocationsFile
	fmt.Printf("Found %d matches:\n\n", result.Total)
	for _, hit := range result.Hits {
		fmt.Printf("File: %s\n", hit.ID)
		var locationsFile LocationsFile
		locationsFile.Filename = hit.ID
		locations := getLineMatches(hit.ID, searchTerm)
		locationsFile.Locations = append(locationsFile.Locations, locations...)
		locationFiles = append(locationFiles, locationsFile)
	}
	return locationFiles, nil
}

func getLineMatches(path, term string) []Location {
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".xlsx":
		return getExcelMatches(path, term)
	case ".docx":
		return getDocxMatches(path, term)
	}

	// Handle other file types (e.g., text)
	file, err := os.Open(path)
	if err != nil {
		fmt.Printf("  Failed to open file: %v\n", err)
		return nil
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNum := 1
	var locations []Location
	for scanner.Scan() {
		line := scanner.Text()
		searchLine := line
		offset := 0
		for {
			index := strings.Index(searchLine, term)
			if index == -1 {
				break
			}
			locations = append(locations, Location{
				Row: lineNum,
				Col: offset + index + 1,
			})
			fmt.Printf("  Line %d, Column %d\n", lineNum, offset+index+1)
			// Move forward in the line
			searchLine = searchLine[index+len(term):]
			offset += index + len(term)
		}
		lineNum++
	}
	return locations
}

// extractContent extracts text content for indexing
func extractContent(path string) (string, error) {
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".docx":
		res, err := docconv.ConvertPath(path)
		if err != nil {
			return "", err
		}
		return res.Body, nil

	case ".xlsx":
		f, err := excelize.OpenFile(path)
		if err != nil {
			return "", err
		}
		defer f.Close()
		var sb strings.Builder
		for _, sheet := range f.GetSheetList() {
			rows, err := f.GetRows(sheet)
			if err != nil {
				continue
			}
			for _, row := range rows {
				for _, cell := range row {
					sb.WriteString(cell)
					sb.WriteString(" ")
				}
				sb.WriteString("\n")
			}
		}
		return sb.String(), nil

	default:
		// Default for normal text/code files
		data, err := os.ReadFile(path)
		return string(data), err
	}
}

func getExcelMatches(path, term string) []Location {
	f, err := excelize.OpenFile(path)
	if err != nil {
		fmt.Printf("  Failed to open Excel file: %v\n", err)
		return nil
	}
	defer f.Close()

	var locations []Location
	for _, sheet := range f.GetSheetList() {
		rows, err := f.GetRows(sheet)
		if err != nil {
			continue
		}
		for rowIdx, row := range rows {
			for colIdx, cell := range row {
				if strings.Contains(strings.ToLower(cell), strings.ToLower(term)) {
					// Excel rows and columns are 1-based for user output
					locations = append(locations, Location{
						Row: rowIdx + 1,
						Col: colIdx + 1,
					})
				}
			}
		}
	}
	return locations
}

func getDocxMatches(path, term string) []Location {

	// Extract text using docconv
	res, err := docconv.ConvertPath(path)
	if err != nil {
		fmt.Printf("  Failed to convert .docx file: %v\n", err)
		return nil
	}

	// Check if term exists (case-insensitive)
	if strings.Contains(strings.ToLower(res.Body), strings.ToLower(term)) {
		return []Location{{Row: 0, Col: 0}} // Indicate term found, no specific location
	}
	return nil
}
