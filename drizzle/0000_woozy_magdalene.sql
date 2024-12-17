CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"sentences" text[] NOT NULL,
	"claims" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
