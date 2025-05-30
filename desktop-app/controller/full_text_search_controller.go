package controller

import (
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
	valiExcelExt := map[string]bool{
		".csv":  true,
		".xlsx": true,
		".xls":  true,
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

		if d.IsDir() {
			base := filepath.Base(path)
			if strings.HasPrefix(base, ".") {
				return filepath.SkipDir
			}
			return nil
		}

		if !valiExcelExt[filepath.Ext(path)] {
			mimeType := docconv.MimeTypeByExtension(filepath.Base(path))
			if mimeType == "application/octet-stream" {
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
	query := bleve.NewQueryStringQuery(fmt.Sprintf("*%s*", searchTerm))
	search := bleve.NewSearchRequestOptions(query, 1000, 0, false)
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
		locationFiles = append(locationFiles, locationsFile)
	}
	return locationFiles, nil
}

func extractContent(path string) (string, error) {

	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".xlsx", ".csv", ".xls":
		f, err := excelize.OpenFile(path)
		if err != nil {
			return "", err
		}
		defer f.Close()
		var sb strings.Builder
		const maxRows = 500

		for _, sheet := range f.GetSheetList() {
			rows, err := f.GetRows(sheet)
			if err != nil {
				continue
			}
			for i, row := range rows {
				if i >= maxRows {
					break
				}
				for _, cell := range row {
					sb.WriteString(cell)
					sb.WriteString(" ")
				}
				sb.WriteString("\n")
			}
		}
		text := sb.String()
		if len(text) > 100_000 {
			text = text[:100_000]
		}
		return text, nil

	default:
		res, err := docconv.ConvertPath(path)
		if err != nil {
			return "", err
		}
		text := res.Body
		if len(text) > 100_000 {
			text = text[:100_000]
		}
		return text, nil
	}
}
