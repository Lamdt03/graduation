package update

import (
	"github.com/Lamdt03/selfupdate"
	"golang.org/x/crypto/ed25519"
	"graduation/desktop-app/build"
	"log"
	"os"
	"time"
)

const host = "https://pub-307544eb45a04ffbba9d883b62e3d6f4.r2.dev/file-monitor.json"

func AutoUpdate(signalCh, isUpdateCh chan bool) {
	// Used `selfupdatectl create-keys` followed by `selfupdatectl print-key`
	publicKey := ed25519.PublicKey{155, 222, 199, 199, 191, 40, 90, 139, 24, 97, 173, 39, 80, 212, 82, 40, 163, 36, 175, 68, 45, 86, 199, 97, 67, 228, 165, 31, 134, 34, 164, 6}

	// The public key above match the signature of the below file served by our CDN

	httpSource := selfupdate.NewHTTPSource(nil, host)

	config := &selfupdate.Config{
		Current:   &selfupdate.Version{Number: build.Version},
		Source:    httpSource,
		Schedule:  selfupdate.Schedule{FetchOnStart: true, Interval: 24 * time.Hour},
		PublicKey: publicKey,

		ProgressCallback:       func(f float64, err error) { log.Println("Download", f, "%") },
		RestartConfirmCallback: func() bool { return true },
		UpgradeConfirmCallback: func(warning string) bool {
			log.Printf("%s\n", warning)
			signalCh <- true
			select {
			case isUpdate := <-isUpdateCh:
				time.Sleep(3 * time.Second)
				return isUpdate
			}
		},
		ExitCallback: func(_ error) { os.Exit(1) },
	}

	_, err := selfupdate.Manage(config)
	if err != nil {
		log.Println("Error while setting up update manager: ", err)
		return
	}
	log.Println("Successfully updated self-update.")
}
