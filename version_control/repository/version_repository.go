package repository

import (
	"gorm.io/gorm"
	"graduation/version_control/model"
)

type VersionRepository struct {
	Db *gorm.DB
}

func NewVersionRepository(db *gorm.DB) *VersionRepository {
	return &VersionRepository{Db: db}
}

func (v *VersionRepository) Save(version *model.Version) error {

}
