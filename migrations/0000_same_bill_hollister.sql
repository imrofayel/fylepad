CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'Default' NOT NULL,
	`lock` integer DEFAULT false NOT NULL,
	`isOpen` integer DEFAULT true NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
