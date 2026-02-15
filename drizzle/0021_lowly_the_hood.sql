CREATE TABLE `reservationFormLabels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cat1Label` varchar(100) NOT NULL DEFAULT '담당자 정보',
	`cat2Label` varchar(100) NOT NULL DEFAULT '행사 정보',
	`cat3Label` varchar(100) NOT NULL DEFAULT '작업 내용',
	`cat4Label` varchar(100) NOT NULL DEFAULT '결제 정보',
	`cat5Label` varchar(100) NOT NULL DEFAULT '프로그램 및 요청사항',
	`sub1_1Label` varchar(100) NOT NULL DEFAULT '담당자 성함',
	`sub1_2Label` varchar(100) NOT NULL DEFAULT '연락처',
	`sub1_3Label` varchar(100) NOT NULL DEFAULT '이메일',
	`sub2_1Label` varchar(100) NOT NULL DEFAULT '행사명',
	`sub2_2Label` varchar(100) NOT NULL DEFAULT '장소',
	`sub2_3Label` varchar(100) NOT NULL DEFAULT '행사 날짜',
	`sub2_4Label` varchar(100) NOT NULL DEFAULT '시작 시간',
	`sub2_5Label` varchar(100) NOT NULL DEFAULT '리허설 시간',
	`sub3_1Label` varchar(100) NOT NULL DEFAULT '분류',
	`sub3_2Label` varchar(100) NOT NULL DEFAULT '촬영 유형',
	`sub3_3Label` varchar(100) NOT NULL DEFAULT '특수 요청',
	`sub3_4Label` varchar(100) NOT NULL DEFAULT '공개 여부',
	`sub4_1Label` varchar(100) NOT NULL DEFAULT '결제 방식',
	`sub4_2Label` varchar(100) NOT NULL DEFAULT '계산서 발행',
	`sub4_3Label` varchar(100) NOT NULL DEFAULT '견적액',
	`sub4_4Label` varchar(100) NOT NULL DEFAULT '결제된 금액',
	`sub4_5Label` varchar(100) NOT NULL DEFAULT '미납 금액',
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservationFormLabels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reservations` ADD `linkUrl` text;--> statement-breakpoint
ALTER TABLE `reservations` ADD `startTime` varchar(100);