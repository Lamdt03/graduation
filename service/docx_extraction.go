package service

import (
	"bytes"
	"fmt"
	"github.com/unidoc/unioffice/v2/document"
	"io"
	"mime/multipart"
	"strings"
)

// 12eed3d477269ae0a76ba3a9376a48084ee411a5c778270eb96b88872ec188e2
type DocxExtraction struct{}

type DocxDiffLocation struct {
	DiffLines []int `json:"diff_lines"`
}

func (d DocxExtraction) extractText(file *multipart.FileHeader) (string, error) {
	// Open the file from form-data
	f, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer f.Close()

	fileBytes, err := io.ReadAll(f)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	// Open DOCX from memory using unioffice's document.Read()
	doc, err := document.Read(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		return "", fmt.Errorf("failed to read docx content: %v", err)
	}
	defer doc.Close()

	var text []string
	for _, para := range doc.Paragraphs() {
		var paraText []string
		for _, run := range para.Runs() { // Extract text from runs inside paragraphs
			paraText = append(paraText, run.Text())
		}
		text = append(text, strings.Join(paraText, " ")) // Join runs into a paragraph
	}
	return strings.Join(text, "\n"), nil
}

// Compare compares two .docx files and returns different lines
func (d DocxExtraction) Compare(file1, file2 *multipart.FileHeader) (*DocxDiffLocation, error) {
	text1, err := d.extractText(file1)
	if err != nil {
		return nil, err
	}
	text2, err := d.extractText(file2)
	if err != nil {
		return nil, err
	}

	lines1 := strings.Split(text1, "\n")
	lines2 := strings.Split(text2, "\n")

	var diff DocxDiffLocation
	maxLines := len(lines1)
	if len(lines2) > maxLines {
		maxLines = len(lines2)
	}

	// Compare line by line
	for i := 0; i < maxLines; i++ {
		var l1, l2 string
		if i < len(lines1) {
			l1 = lines1[i]
		}
		if i < len(lines2) {
			l2 = lines2[i]
		}
		if l1 != l2 {
			diff.DiffLines = append(diff.DiffLines, i+1)
		}
	}
	return &diff, nil
}
