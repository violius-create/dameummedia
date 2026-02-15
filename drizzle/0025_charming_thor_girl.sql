ALTER TABLE `reservations` ADD `guestPassword` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);