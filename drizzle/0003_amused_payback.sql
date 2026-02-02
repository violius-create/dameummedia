CREATE TABLE `heroBackgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('image','video') NOT NULL,
	`mediaUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`thumbnailUrl` text,
	`uploadedBy` int NOT NULL,
	`isActive` int DEFAULT 1,
	`order` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heroBackgrounds_id` PRIMARY KEY(`id`),
	CONSTRAINT `heroBackgrounds_fileKey_unique` UNIQUE(`fileKey`)
);
