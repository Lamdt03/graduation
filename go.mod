module graduation

go 1.23.0

toolchain go1.23.7

require (
	code.sajari.com/docconv/v2 v2.0.0-pre.4
	git.cystack.org/endpoint/dlp v1.12.3
	github.com/Lamdt03/selfupdate v0.0.0-20250528073205-f86503266731
	github.com/blevesearch/bleve/v2 v2.5.1
	github.com/gin-contrib/cors v1.7.5
	github.com/gin-gonic/gin v1.10.0
	github.com/google/uuid v1.6.0
	github.com/rs/zerolog v1.34.0
	github.com/urfave/cli/v2 v2.27.6
	github.com/wailsapp/wails/v2 v2.10.1
	github.com/xuri/excelize/v2 v2.9.0
	golang.org/x/crypto v0.37.0
	golang.org/x/sys v0.32.0
	gopkg.in/natefinch/lumberjack.v2 v2.2.1
	gorm.io/driver/sqlite v1.5.7
	gorm.io/gorm v1.26.1
)

replace git.cystack.org/endpoint/dlp v1.12.3 => ../dlp

require (
	github.com/JalfResi/justext v0.0.0-20170829062021-c0282dea7198 // indirect
	github.com/Masterminds/semver v1.5.0 // indirect
	github.com/PuerkitoBio/goquery v1.5.1 // indirect
	github.com/RoaringBitmap/roaring/v2 v2.4.5 // indirect
	github.com/abdfnx/gosh v0.4.0 // indirect
	github.com/advancedlogic/GoOse v0.0.0-20191112112754-e742535969c1 // indirect
	github.com/andybalholm/cascadia v1.2.0 // indirect
	github.com/araddon/dateparse v0.0.0-20200409225146-d820a6159ab1 // indirect
	github.com/bep/debounce v1.2.1 // indirect
	github.com/bits-and-blooms/bitset v1.22.0 // indirect
	github.com/blevesearch/bleve_index_api v1.2.8 // indirect
	github.com/blevesearch/geo v0.2.3 // indirect
	github.com/blevesearch/go-faiss v1.0.25 // indirect
	github.com/blevesearch/go-porterstemmer v1.0.3 // indirect
	github.com/blevesearch/gtreap v0.1.1 // indirect
	github.com/blevesearch/mmap-go v1.0.4 // indirect
	github.com/blevesearch/scorch_segment_api/v2 v2.3.10 // indirect
	github.com/blevesearch/segment v0.9.1 // indirect
	github.com/blevesearch/snowballstem v0.9.0 // indirect
	github.com/blevesearch/upsidedown_store_api v1.0.2 // indirect
	github.com/blevesearch/vellum v1.1.0 // indirect
	github.com/blevesearch/zapx/v11 v11.4.2 // indirect
	github.com/blevesearch/zapx/v12 v12.4.2 // indirect
	github.com/blevesearch/zapx/v13 v13.4.2 // indirect
	github.com/blevesearch/zapx/v14 v14.4.2 // indirect
	github.com/blevesearch/zapx/v15 v15.4.2 // indirect
	github.com/blevesearch/zapx/v16 v16.2.3 // indirect
	github.com/bytedance/sonic v1.13.2 // indirect
	github.com/bytedance/sonic/loader v0.2.4 // indirect
	github.com/cloudwego/base64x v0.1.5 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.5 // indirect
	github.com/fatih/set v0.2.1 // indirect
	github.com/gabriel-vasile/mimetype v1.4.8 // indirect
	github.com/gigawattio/window v0.0.0-20180317192513-0f5467e35573 // indirect
	github.com/gin-contrib/sse v1.1.0 // indirect
	github.com/go-ole/go-ole v1.3.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	github.com/go-playground/universal-translator v0.18.1 // indirect
	github.com/go-playground/validator/v10 v10.26.0 // indirect
	github.com/go-resty/resty/v2 v2.3.0 // indirect
	github.com/goccy/go-json v0.10.5 // indirect
	github.com/godbus/dbus/v5 v5.1.0 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/jaytaylor/html2text v0.0.0-20200412013138-3577fbdbcff7 // indirect
	github.com/jchv/go-winloader v0.0.0-20210711035445-715c2860da7e // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/klauspost/cpuid/v2 v2.2.10 // indirect
	github.com/labstack/echo/v4 v4.13.3 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/leaanthony/go-ansi-parser v1.6.1 // indirect
	github.com/leaanthony/gosod v1.0.4 // indirect
	github.com/leaanthony/slicer v1.6.0 // indirect
	github.com/leaanthony/u v1.1.1 // indirect
	github.com/leodido/go-urn v1.4.0 // indirect
	github.com/levigross/exp-html v0.0.0-20120902181939-8df60c69a8f5 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.16 // indirect
	github.com/mattn/go-sqlite3 v1.14.28 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/mschoch/smat v0.2.0 // indirect
	github.com/olekukonko/tablewriter v0.0.4 // indirect
	github.com/otiai10/gosseract/v2 v2.2.4 // indirect
	github.com/pelletier/go-toml/v2 v2.2.4 // indirect
	github.com/pkg/browser v0.0.0-20240102092130-5ac0b6a4141c // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/radovskyb/watcher v1.0.7 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.4 // indirect
	github.com/rivo/uniseg v0.4.7 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/samber/lo v1.49.1 // indirect
	github.com/ssor/bom v0.0.0-20170718123548-6386211fdfcf // indirect
	github.com/tkrajina/go-reflector v0.5.8 // indirect
	github.com/twitchyliquid64/golang-asm v0.15.1 // indirect
	github.com/ugorji/go/codec v1.2.12 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/wailsapp/go-webview2 v1.0.19 // indirect
	github.com/wailsapp/mimetype v1.4.1 // indirect
	github.com/xrash/smetrics v0.0.0-20240521201337-686a1a2994c1 // indirect
	github.com/xuri/efp v0.0.0-20240408161823-9ad904a10d6d // indirect
	github.com/xuri/nfp v0.0.0-20240318013403-ab9948c2c4a7 // indirect
	go.etcd.io/bbolt v1.4.0 // indirect
	golang.org/x/arch v0.16.0 // indirect
	golang.org/x/image v0.25.0 // indirect
	golang.org/x/net v0.39.0 // indirect
	golang.org/x/text v0.25.0 // indirect
	google.golang.org/protobuf v1.36.6 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	lukechampine.com/blake3 v1.3.0 // indirect
)
