ALTER TABLE `reservationFormLabels` ADD `eventTypeOption1` varchar(100) DEFAULT '사진 촬영' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `eventTypeOption2` varchar(100) DEFAULT '공연 촬영' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `eventTypeOption3` varchar(100) DEFAULT '영상 제작' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `eventTypeOption4` varchar(100) DEFAULT '뮤직비디오 제작' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `eventTypeOption5` varchar(100) DEFAULT '기타' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption1` varchar(100) DEFAULT 'Photo' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption2` varchar(100) DEFAULT 'Solo' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption3` varchar(100) DEFAULT 'Recording' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption4` varchar(100) DEFAULT 'Simple' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption5` varchar(100) DEFAULT 'Basic' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `recordingTypeOption6` varchar(100) DEFAULT 'Professional' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `specialReqOption1` varchar(100) DEFAULT '드론' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `specialReqOption2` varchar(100) DEFAULT '짐벌' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `specialReqOption3` varchar(100) DEFAULT '지미집' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `specialReqOption4` varchar(100) DEFAULT '기타' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `isPublicOption1` varchar(100) DEFAULT '허용' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `isPublicOption2` varchar(100) DEFAULT '불허' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `paymentMethodOption1` varchar(100) DEFAULT '카드' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `paymentMethodOption2` varchar(100) DEFAULT '계좌이체' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `paymentMethodOption3` varchar(100) DEFAULT '현금' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `receiptTypeOption1` varchar(100) DEFAULT '발행' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `receiptTypeOption2` varchar(100) DEFAULT '미발행' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationFormLabels` ADD `receiptTypeOption3` varchar(100) DEFAULT '간이영수증' NOT NULL;