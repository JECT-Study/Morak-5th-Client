import WithdrawalForm from "@/features/settings/components/withdrawal-form";
import AppHeader from "@/shared/layout/app-header";

export default function WithdrawalPage() {
  return (
    <>
      <AppHeader nested title="회원 탈퇴" />
      <WithdrawalForm />
    </>
  );
}
