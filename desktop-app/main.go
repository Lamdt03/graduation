package main

import (
	"embed"
	"graduation/desktop-app/controller"
	"graduation/desktop-app/update"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {

	update.AutoUpdate()
	// Create an instance of the app structure
	app := NewApp()
	fullTextSearchController := &controller.SearchController{}

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "desktop-app",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			fullTextSearchController,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
