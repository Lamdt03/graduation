package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"graduation/controller"
	"graduation/route"
	"graduation/service"
	"time"
)

func main() {
	router := gin.Default()
	//config := cors.Config{
	//	AllowAllOrigins:  true, // 👈 allow any origin
	//	AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
	//	AllowHeaders:     []string{"*"}, // allow all headers
	//	AllowCredentials: true,
	//	MaxAge:           12 * time.Hour,
	//}
	//router.Use(cors.New(config))

	newExcelExtractionService := service.NewExcelExTraction()
	newTextExtractionService := service.NewTextExtraction()
	uploadController := controller.NewUploadController(*newExcelExtractionService, *newTextExtractionService)
	route.UploadRoute(router, uploadController)

	config := cors.Config{
		AllowAllOrigins:  true, // 👈 allow any origin
		AllowMethods:     []string{"POST", "GET", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:     []string{"*"}, // allow all headers
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(config))

	router.Run(":8080")
}
