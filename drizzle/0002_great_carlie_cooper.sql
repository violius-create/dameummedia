CREATE TABLE `galleryItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('image','video') NOT NULL,
	`category` enum('concert','film') NOT NULL,
	`mediaUrl` text NOT NULL,
	`thumbnailUrl` text,
	`fileKey` varchar(255) NOT NULL,
	`uploadedBy` int NOT NULL,
	`order` int DEFAULT 0,
	`featured` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `galleryItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `galleryItems_fileKey_unique` UNIQUE(`fileKey`)
);
