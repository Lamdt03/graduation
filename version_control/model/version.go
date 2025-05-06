package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Version struct {
	ID           string `json:"id" gorm:"column:id;primaryKey"`
	TimeModified string `json:"time_modified" gorm:"column:time_modified"`
	FileId       string `json:"file_id" gorm:"column:file_id;not null"`
	VersionPath  string `json:"version_path" gorm:"column:version_path;not null"`
}

func NewVersion(timeModified, versionPath, fileId string) *Version {
	return &Version{
		TimeModified: timeModified,
		VersionPath:  versionPath,
		FileId:       fileId,
	}
}

func (v *Version) BeforeCreate(db *gorm.DB) error {
	for {
		if v.ID == "" {
			v.ID = uuid.NewString()
		}

		// Check if the generated ID already exists in the database
		var count int64
		if err := db.Model(&Version{}).Where("id = ?", v.ID).Count(&count).Error; err != nil {
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
