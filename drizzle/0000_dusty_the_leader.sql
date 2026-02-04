CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `heroBackgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('image','video') NOT NULL,
	`mediaUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`uploadedBy` int NOT NULL,
	`section` enum('main','section2','section3') NOT NULL DEFAULT 'main',
	`isActive` int DEFAULT 1,
	`order` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heroBackgrounds_id` PRIMARY KEY(`id`),
	CONSTRAINT `heroBackgrounds_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedBy` int NOT NULL,
	`postId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `images_id` PRIMARY KEY(`id`),
	CONSTRAINT `images_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('notice','portfolio','review','concert','film') NOT NULL,
	`authorId` int NOT NULL,
	`imageUrl` text,
	`videoUrl` text,
	`viewCount` int DEFAULT 0,
	`featured` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(20),
	`eventName` varchar(255) NOT NULL,
	`eventType` enum('concert','film','other') NOT NULL,
	`venue` varchar(255),
	`eventDate` timestamp,
	`rehearsalTime` varchar(100),
	`composition` text,
	`managerName` varchar(255),
	`managerPhone` varchar(20),
	`recordingStaff` varchar(255),
	`photographyStaff` varchar(255),
	`audioSettings` text,
	`projectMonitor` varchar(255),
	`paymentMethod` enum('card','transfer','cash','other'),
	`isPublic` int DEFAULT 1,
	`receiptType` enum('individual','business','other'),
	`paidAmount` int DEFAULT 0,
	`unpaidAmount` int DEFAULT 0,
	`description` text,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sectionTitles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionKey` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sectionTitles_id` PRIMARY KEY(`id`),
	CONSTRAINT `sectionTitles_sectionKey_unique` UNIQUE(`sectionKey`)
);
--> statement-breakpoint
CREATE TABLE `serviceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemKey` varchar(100),
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('image','video') NOT NULL,
	`mediaUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`uploadedBy` int NOT NULL,
	`order` int DEFAULT 0,
	`isActive` int DEFAULT 1,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceItems_itemKey_unique` UNIQUE(`itemKey`),
	CONSTRAINT `serviceItems_fileKey_unique` UNIQUE(`fileKey`)
);
--> statement-breakpoint
CREATE TABLE `siteBranding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logoUrl` text,
	`logoFileKey` varchar(255),
	`title` varchar(255) NOT NULL DEFAULT '담음미디어',
	`subtitle` varchar(255) NOT NULL DEFAULT 'Professional Media Production',
	`instagramUrl` varchar(255) DEFAULT 'https://instagram.com',
	`youtubeUrl` varchar(255) DEFAULT 'https://youtube.com',
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteBranding_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
