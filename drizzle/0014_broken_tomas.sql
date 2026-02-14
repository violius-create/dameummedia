CREATE TABLE `heroTextRotation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text1Title` varchar(500) NOT NULL DEFAULT 'Professional Media Production',
	`text1Description` varchar(500) DEFAULT 'Record, Mixing, Mastering and Videos',
	`text2Title` varchar(500) DEFAULT '',
	`text2Description` varchar(500) DEFAULT '',
	`text3Title` varchar(500) DEFAULT '',
	`text3Description` varchar(500) DEFAULT '',
	`intervalMs` int NOT NULL DEFAULT 2000,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heroTextRotation_id` PRIMARY KEY(`id`)
);
