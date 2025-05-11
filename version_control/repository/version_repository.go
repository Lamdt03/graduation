package repository

import (
	"gorm.io/gorm"
)

type VersionRepository struct {
	Db *gorm.DB
}

func NewVersionRepository(db *gorm.DB) *VersionRepository {
	return &VersionRepository{Db: db}
}
