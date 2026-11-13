import ChallengeDetailTabs from "@/features/challenge/components/challenge-detail/challenge-detail-tabs";
import ChallengeInfo from "@/features/challenge/components/challenge-detail/challenge-info";
import AppHeader from "@/shared/layout/app-header";

// TODO: 챌린지 상세 API가 나오면 [id]로 조회한 값으로 바꾼다.
const challengeMock = {
  title: "매일 아침 6시 기상 인증",
  category: "생활습관",
  coverImageUrl: null,
  dDayLabel: "D-12",
  typeLabel: "데일리",
  isPrivate: true,
  verificationLabel: "사진 인증",
  startDate: "2026-10-20",
  endDate: "2026-11-16",
  durationWeeks: 4,
  memberCount: 8,
  capacity: 10,
  pointAmount: 10000,
};

const introMock = {
  description:
    "매일 아침 6시에 일어나 하루를 일찍 시작해요. 기상 직후 시계가 보이는 사진으로 인증하고, 4주 동안 함께 아침 습관을 만들어요.",
  startDate: challengeMock.startDate,
  endDate: challengeMock.endDate,
  durationWeeks: challengeMock.durationWeeks,
  certificationTime: "매일 05:00 ~ 06:00",
  verificationMethod: "기상 직후 시간이 보이는 사진 인증",
  capacity: challengeMock.capacity,
  memberCount: challengeMock.memberCount,
  pointAmount: challengeMock.pointAmount,
  rules: [
    "인증률 80% 이상 · 참여 포인트 전액 반환",
    "인증률 50% 이상 · 참여 포인트 절반 반환",
    "인증률 50% 미만 · 참여 포인트 반환 없음",
  ],
  notices: [
    "인증 시간이 지나면 그날 인증은 할 수 없어요.",
    "챌린지가 시작되면 중간에 나갈 수 없어요.",
  ],
};

export default function ChallengeDetailPage() {
  return (
    <>
      <AppHeader nested title="챌린지 상세" />
      <ChallengeInfo {...challengeMock} />
      <ChallengeDetailTabs intro={introMock} />
    </>
  );
}
