CREATE TABLE `instagramPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`fileKey` varchar(255),
	`postUrl` varchar(500),
	`caption` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instagramPosts_id` PRIMARY KEY(`id`)
);
