package controller

import (
	"github.com/gin-gonic/gin"
	"graduation/service"
	"net/http"
)

type UploadController struct {
	excelService service.ExcelExTraction
	textService  service.TextExtraction
}

func NewUploadController(excelService service.ExcelExTraction, textService service.TextExtraction) *UploadController {
	return &UploadController{excelService: excelService, textService: textService}
}

func (u *UploadController) CompareTextFiles(c *gin.Context) {
	files1, err := c.FormFile("file1")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
	files2, err := c.FormFile("file2")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	diff, err := u.textService.Compare(files1, files2)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
	c.JSON(http.StatusOK, &diff)

}

func (u *UploadController) CompareExcelFiles(c *gin.Context) {
	files1, err := c.FormFile("file1")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
	files2, err := c.FormFile("file2")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	diff, err := u.excelService.Compare(files1, files2)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, diff)

	}
}
