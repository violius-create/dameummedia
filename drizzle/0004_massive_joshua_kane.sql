ALTER TABLE `reservations` ADD `eventName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `venue` varchar(255);--> statement-breakpoint
ALTER TABLE `reservations` ADD `rehearsalTime` varchar(100);--> statement-breakpoint
ALTER TABLE `reservations` ADD `composition` text;--> statement-breakpoint
ALTER TABLE `reservations` ADD `managerName` varchar(255);--> statement-breakpoint
ALTER TABLE `reservations` ADD `managerPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `reservations` ADD `recordingStaff` varchar(255);--> statement-breakpoint
ALTER TABLE `reservations` ADD `photographyStaff` varchar(255);--> statement-breakpoint
ALTER TABLE `reservations` ADD `audioSettings` text;--> statement-breakpoint
ALTER TABLE `reservations` ADD `projectMonitor` varchar(255);--> statement-breakpoint
ALTER TABLE `reservations` ADD `paymentMethod` enum('card','transfer','cash','other');--> statement-breakpoint
ALTER TABLE `reservations` ADD `isPublic` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `reservations` ADD `receiptType` enum('individual','business','other');--> statement-breakpoint
ALTER TABLE `reservations` ADD `paidAmount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `reservations` ADD `unpaidAmount` int DEFAULT 0;