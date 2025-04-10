package service

import (
	"bufio"
	"fmt"
	"mime/multipart"
)

type TextExtraction struct {
}

type TextDiffLocation struct {
	DiffLines []int `json:"diff_lines"`
}

func NewTextExtraction() *TextExtraction {
	return &TextExtraction{}
}

// Compare finds differing line numbers between two text files
func (t *TextExtraction) Compare(file1, file2 *multipart.FileHeader) (*TextDiffLocation, error) {
	// Open file1
	f1, err := file1.Open()
	if err != nil {
		return nil, fmt.Errorf("open file1 error: %v", err)
	}
	defer f1.Close()

	// Open file2
	f2, err := file2.Open()
	if err != nil {
		return nil, fmt.Errorf("open file2 error: %v", err)
	}
	defer f2.Close()

	// Create scanners for both files
	scanner1 := bufio.NewScanner(f1)
	scanner2 := bufio.NewScanner(f2)

	var diffLines []int
	lineNumber := 0

	// Compare files line by line
	for scanner1.Scan() && scanner2.Scan() {
		lineNumber++
		line1 := scanner1.Text()
		line2 := scanner2.Text()

		// If lines are different, store the line number
		if line1 != line2 {
			diffLines = append(diffLines, lineNumber)
		}
	}

	// Check for scanner errors
	if err := scanner1.Err(); err != nil {
		return nil, fmt.Errorf("error reading file1: %v", err)
	}
	if err := scanner2.Err(); err != nil {
		return nil, fmt.Errorf("error reading file2: %v", err)
	}

	return &TextDiffLocation{DiffLines: diffLines}, nil
}
