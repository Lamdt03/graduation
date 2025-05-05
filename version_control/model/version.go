package model

type Version struct {
	ID           string  `json:"id" gorm:"column:id;primaryKey"`
	TimeModified int64   `json:"time_modified" gorm:"column:time_modified"`
	FileId       string  `json:"file_id" gorm:"column:file_id;not null"`
	Blocks       []Block `json:"blocks" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
