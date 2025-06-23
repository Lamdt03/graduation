package model

import (
	"container/list"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileInfos struct {
	ID       string    `json:"id" gorm:"column:id;primaryKey"`
	Filepath string    `json:"filepath" gorm:"column:filepath"`
	Versions []Version `json:"versions" gorm:"foreignKey:FileId;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func NewFileInfo(filepath string) *FileInfos {
	return &FileInfos{
		Filepath: filepath,
	}
}

type EventLog struct {
	Path      string `json:"path"`
	Timestamp string `json:"timestamp"`
	Event     string `json:"event"`
}

var BackupLogsList = list.New()

func (v *FileInfos) BeforeCreate(db *gorm.DB) error {
	for {
		if v.ID == "" {
			v.ID = uuid.NewString()
		}

		// Check if the generated ID already exists in the database
		var count int64
		if err := db.Model(&FileInfos{}).Where("id = ?", v.ID).Count(&count).Error; err != nil {
			return err // Return if there's an error while querying
		}

		// Break the loop if the ID is unique
		if count == 0 {
			break
		}

		// Generate a new UUID if there's a conflict
		v.ID = uuid.NewString()
	}

	return nil
}
