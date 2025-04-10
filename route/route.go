package route

import (
	"github.com/gin-gonic/gin"
	"graduation/controller"
)

func UploadRoute(router *gin.Engine, controller *controller.UploadController) {
	uploadGroup := router.Group("/api/compare")
	{
		uploadGroup.POST("/text", controller.CompareTextFiles)
		uploadGroup.POST("/excel", controller.CompareExcelFiles)
	}
}
