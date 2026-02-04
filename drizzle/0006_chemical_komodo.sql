ALTER TABLE `reservations` MODIFY COLUMN `eventType` enum('photo','concert','video','music_video','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `attachments` text;