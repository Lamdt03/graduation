package service

import (
	"bytes"
	"fmt"
	"github.com/xuri/excelize/v2"
	"io"
	"mime/multipart"
)

type ExcelExTraction struct {
}

func NewExcelExTraction() *ExcelExTraction {
	return &ExcelExTraction{}
}

type ExcelDiffLocation struct {
	SheetName string   `json:"sheet_name"`
	Cells     []string `json:"cells"`
}

func (e *ExcelExTraction) Compare(file1, file2 *multipart.FileHeader) ([]ExcelDiffLocation, error) {
	// Read file1 into memory
	f1, err := file1.Open()
	if err != nil {
		return nil, fmt.Errorf("open file error: %v", err)
	}
	defer f1.Close()

	file1Bytes, _ := io.ReadAll(f1)

	// Read file2 into memory
	f2, err := file2.Open()
	if err != nil {
		return nil, fmt.Errorf("open file error: %v", err)
	}
	defer f2.Close()

	file2Bytes, _ := io.ReadAll(f2)

	// Open files using excelize
	excel1, err := excelize.OpenReader(bytes.NewReader(file1Bytes))
	if err != nil {
		return nil, fmt.Errorf("invalid excel format: %v", err)
	}
	defer excel1.Close()

	excel2, err := excelize.OpenReader(bytes.NewReader(file2Bytes))
	if err != nil {
		return nil, fmt.Errorf("invalid excel format: %v", err)
	}
	defer excel2.Close()

	// Get common sheets
	sheets1 := excel1.GetSheetList()
	sheets2 := excel2.GetSheetList()

	var differences []ExcelDiffLocation

	for _, sheet := range sheets1 {
		if contains(sheets2, sheet) {
			differences = append(differences, compareSheets(excel1, excel2, sheet))
		}
	}
	return differences, nil
}

// compareSheets compares the contents of two sheets and returns differences
func compareSheets(file1, file2 *excelize.File, sheetName string) ExcelDiffLocation {
	var differences ExcelDiffLocation
	differences.SheetName = sheetName
	rows1, _ := file1.GetRows(sheetName)
	rows2, _ := file2.GetRows(sheetName)

	// Get the max row count
	maxRows := len(rows1)
	if len(rows2) > maxRows {
		maxRows = len(rows2)
	}

	for i := 0; i < maxRows; i++ {
		var row1 []string
		var row2 []string

		if i < len(rows1) {
			row1 = rows1[i]
		}
		if i < len(rows2) {
			row2 = rows2[i]
		}

		// Get max column count
		maxCols := len(row1)
		if len(row2) > maxCols {
			maxCols = len(row2)
		}

		for j := 0; j < maxCols; j++ {
			val1, val2 := "", ""

			if j < len(row1) {
				val1 = row1[j]
			}
			if j < len(row2) {
				val2 = row2[j]
			}

			// Compare values
			if val1 != val2 {
				cellName, _ := excelize.CoordinatesToCellName(j+1, i+1)
				differences.Cells = append(differences.Cells, cellName)
			}
		}
	}

	return differences
}

func contains(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}
