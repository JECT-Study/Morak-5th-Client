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

export default function ChallengeDetailPage() {
  return (
    <>
      <AppHeader nested title="챌린지 상세" />
      <ChallengeInfo {...challengeMock} />
    </>
  );
}
