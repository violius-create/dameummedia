CREATE TABLE `boardLayoutSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boardKey` varchar(100) NOT NULL,
	`itemsPerPage` int NOT NULL DEFAULT 12,
	`displayMode` varchar(50) NOT NULL DEFAULT 'gallery',
	`containerWidth` varchar(50) NOT NULL DEFAULT 'container',
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boardLayoutSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `boardLayoutSettings_boardKey_unique` UNIQUE(`boardKey`)
);
--> statement-breakpoint
CREATE TABLE `footerSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL DEFAULT '담음미디어',
	`copyrightText` varchar(255) NOT NULL DEFAULT 'All rights reserved.',
	`address` text,
	`phone` varchar(50),
	`email` varchar(255),
	`businessNumber` varchar(50),
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `footerSettings_id` PRIMARY KEY(`id`)
);
