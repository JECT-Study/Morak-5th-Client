import DailyChallengeForm from "@/features/challenge/components/challenge-new/daily-challenge-form";
import AppHeader from "@/shared/layout/app-header";

export default function NewDailyChallengePage() {
  return (
    <>
      <AppHeader nested title="데일리 챌린지 만들기" />
      <main className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
        <DailyChallengeForm />
      </main>
    </>
  );
}
