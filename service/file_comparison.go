package service

import "mime/multipart"

type FileComparison interface {
	Compare(file1, file2 *multipart.FileHeader) (DiffLocation, error)
}

type DiffLocation interface {
	GetDiffLocation() []string
}
