CREATE TABLE IF NOT EXISTS "imgs" (
	"id"	INTEGER NOT NULL UNIQUE,
	"path"	TEXT NOT NULL,
	"page"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "usage" (
	"id"    INTEGER NOT NULL UNIQUE,
	"type" TEXT NOT NULL,
	"target" TEXT NOT NULL,
	"status" INTEGER NOT NULL,
	"ip" TEXT NOT NULL,
	"ua" TEXT,
	"time" INTEGER NOT NULL,
	"extra" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
