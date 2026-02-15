ALTER TABLE `reservationFormLabels` ADD `sub4_6Label` varchar(100) DEFAULT '진행상황' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption1` varchar(100) DEFAULT '접수중' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption2` varchar(100) DEFAULT '예약완료' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption3` varchar(100) DEFAULT '준비중' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption4` varchar(100) DEFAULT '작업중' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption5` varchar(100) DEFAULT '작업완료' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `progressOption6` varchar(100) DEFAULT '취소' NOT NULL;