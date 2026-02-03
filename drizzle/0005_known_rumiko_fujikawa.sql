CREATE TABLE `serviceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('image','video') NOT NULL,
	`mediaUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`thumbnailUrl` text,
	`uploadedBy` int NOT NULL,
	`order` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceItems_fileKey_unique` UNIQUE(`fileKey`)
);
