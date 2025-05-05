package config

import "database/sql"

func ConnectDb() *sql.DB {
	db, err := sql.Open("sqlite3")
}
