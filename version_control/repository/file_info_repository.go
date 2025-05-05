package repository

import (
	"fmt"
	"gorm.io/gorm"
	"graduation/version_control/model"
)

type FileInfoRepository struct {
	Db *gorm.DB
}

func (f *FileInfoRepository) GetFileInfo(filepath string) (*model.FileInfo, error) {
	var fi model.FileInfo
	err := f.Db.Where("filepath = ?", filepath).First(&fi)
	if err != nil {
		return nil, fmt.Errorf("GetFileInfo from db error: %v", err)
	}
	return &fi, nil
}

func (f *FileInfoRepository) CreateFileInfo(fi *model.FileInfo) error {
	err := f.Db.Create(fi).Error
	if err != nil {
		return fmt.Errorf("CreateFileInfo from db error: %v", err)
	}
	return nil
}

func (f *FileInfoRepository) UpdateFileInfo(filepath, newPath string) error {
	err := f.Db.Model(model.FileInfo{}).Where("filepath = ?", filepath).Update("filepath", newPath).Error
	if err != nil {
		return fmt.Errorf("UpdateFileInfo from db error: %v", err)
	}
	return nil
}

func (f *FileInfoRepository) DeleteFileInfo(filepath string) error {
	err := f.Db.Where("filepath = ?", filepath).Delete(&model.FileInfo{}).Error
	if err != nil {
		return fmt.Errorf("DeleteFileInfo from db error: %v", err)

	}
	return nil
}
