package model

import (
	"crypto/md5"
	"encoding/hex"
)

type Block struct {
	ID        string `json:"id" gorm:"column:id;primaryKey"`
	Offset    int64  `json:"offset"`
	Hash      string `json:"hash"`
	VersionId string `json:"version_id" gorm:"column:version_id;not null"`
}

func NewBlock(data []byte, offset int64) *Block {
	h := md5.Sum(data)
	hash := hex.EncodeToString(h[:])
	return &Block{
		Hash:   hash,
		Offset: offset,
	}
}
