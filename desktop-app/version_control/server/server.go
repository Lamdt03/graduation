package server

import (
	"github.com/gin-gonic/gin"
)

func StartServer() error {
	router := gin.Default()
	router.GET("/file-target", func(c *gin.Context) {
		path := c.Query("path")
		target := c.Query("target")

	})
	router.Run(":9293")
}
