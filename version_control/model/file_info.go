package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileInfo struct {
	ID       string    `json:"id" gorm:"column:id;primaryKey"`
	Filepath string    `json:"filepath" gorm:"column:filepath"`
	Versions []Version `json:"versions" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func NewFileInfo(filepath string) *FileInfo {
	return &FileInfo{
		Filepath: filepath,
	}
}

func (f *FileInfo) BeforeCreate(db *gorm.DB) error {
	for {
		if f.ID == "" {
			f.ID = uuid.NewString()
		}

		// Check if the generated ID already exists in the database
		var count int64
		if err := db.Model(&FileInfo{}).Where("id = ?", f.ID).Count(&count).Error; err != nil {
			return err // Return if there's an error while querying
		}

		// Break the loop if the ID is unique
		if count == 0 {
			break
		}

		// Generate a new UUID if there's a conflict
		f.ID = uuid.NewString()
	}

	return nil
}
