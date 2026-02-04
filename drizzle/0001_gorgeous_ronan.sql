CREATE TABLE `priceAddOns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`order` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `priceAddOns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricePackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`basePrice` int NOT NULL,
	`cameraCount` varchar(100),
	`cameraType` varchar(255),
	`microphoneCount` varchar(100),
	`microphoneType` varchar(255),
	`operatorCount` varchar(100),
	`targetAudience` text,
	`order` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricePackages_id` PRIMARY KEY(`id`)
);
