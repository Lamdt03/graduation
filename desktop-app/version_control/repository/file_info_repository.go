package repository

import (
	"desktop-app/version_control/model"
	"errors"
	"fmt"
	"gorm.io/gorm"
)

type FileInfoRepository struct {
	Db *gorm.DB
}

func NewFileInfoRepository(db *gorm.DB) *FileInfoRepository {
	return &FileInfoRepository{
		Db: db,
	}
}

func (f *FileInfoRepository) GetFileInfo(filepath string) (*model.FileInfos, error) {
	var fi model.FileInfos
	result := f.Db.Where("filepath = ?", filepath).First(&fi)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			fi.Filepath = filepath
			err := f.CreateFileInfo(&fi)
			if err != nil {
				return nil, fmt.Errorf("CreateFileInfo error: %v", err)
			} else {
				return &fi, nil
			}
		}
		return nil, fmt.Errorf("GetFileInfo from db error: %v", result.Error)
	}
	return &fi, nil
}

func (f *FileInfoRepository) CreateFileInfo(fi *model.FileInfos) error {
	err := f.Db.Create(fi).Error
	if err != nil {
		return fmt.Errorf("CreateFileInfo from db error: %v", err)
	}
	return nil
}

func (f *FileInfoRepository) UpdateFileInfo(filepath, newPath string) error {
	err := f.Db.Model(model.FileInfos{}).Where("filepath = ?", filepath).Update("filepath", newPath).Error
	if err != nil {
		return fmt.Errorf("UpdateFileInfo from db error: %v", err)
	}
	return nil
}

func (f *FileInfoRepository) DeleteFileInfo(filepath string) error {
	err := f.Db.Where("filepath = ?", filepath).Delete(&model.FileInfos{}).Error
	if err != nil {
		return fmt.Errorf("DeleteFileInfo from db error: %v", err)

	}
	return nil
}
