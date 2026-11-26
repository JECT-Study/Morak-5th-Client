import ArchivedChallenges from "@/features/challenge/components/archived-challenges";
import AppHeader from "@/shared/layout/app-header";

export default function ArchivedChallengesPage() {
  return (
    <>
      <AppHeader nested title="종료된 챌린지" backHref="/my" />
      <ArchivedChallenges />
    </>
  );
}
