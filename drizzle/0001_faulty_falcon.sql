CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "activities_date_unique" UNIQUE("date")
);
--> statement-breakpoint
DROP TABLE "todos" CASCADE;