CREATE TABLE `siteBranding` (
`id` int AUTO_INCREMENT NOT NULL,
`logoUrl` text,
`logoFileKey` varchar(255),
`title` varchar(255) NOT NULL DEFAULT '담음미디어',
`subtitle` varchar(255) NOT NULL DEFAULT 'Professional Media Production',
`uploadedBy` int NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `siteBranding_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `heroBackgrounds` ADD `description` text;--> statement-breakpoint
ALTER TABLE `heroBackgrounds` ADD `section` enum('main','section2','section3') DEFAULT 'main' NOT NULL;
