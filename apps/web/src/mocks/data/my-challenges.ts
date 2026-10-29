import type { MyChallengeCardData } from "@/features/challenge/types";

/** 홈 카드 화면 개발용 목 데이터(Figma "챌린지 다이어리" 기준). API 연결 후 MSW 핸들러로 옮긴다. */
export const myChallengesMock: MyChallengeCardData[] = [
  {
    id: 1,
    category: "생활습관",
    isPrivate: true,
    title: "매일 아침 6시 기상 인증",
    description: "규칙적인 아침 루틴으로 건강한 하루 시작하기",
    currentDay: 5,
    totalDays: 14,
    startDate: "2025-10-01",
    endDate: "2025-10-14",
    memberCount: 4,
    successRate: 60,
    depositAmount: 5000,
    todayCertifications: [
      {
        memberId: 1,
        imageUrl: "/mock/certification-1.png",
        certifiedAt: "2025-10-05T06:02:00+09:00",
      },
      {
        memberId: 2,
        imageUrl: "/mock/certification-2.png",
        certifiedAt: "2025-10-05T06:15:00+09:00",
      },
    ],
  },
  {
    id: 2,
    category: "독서",
    isPrivate: false,
    title: "하루 30분 책 읽기",
    description: "읽은 페이지를 사진으로 인증해요",
    currentDay: 12,
    totalDays: 30,
    startDate: "2025-09-24",
    endDate: "2025-10-23",
    memberCount: 5,
    successRate: 82,
    depositAmount: 10000,
    todayCertifications: [
      {
        memberId: 3,
        imageUrl: "/mock/certification-2.png",
        certifiedAt: "2025-10-05T21:40:00+09:00",
      },
    ],
  },
];
