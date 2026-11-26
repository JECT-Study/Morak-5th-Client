import { InviteCodeForm } from "@/features/challenge/components/invite-entry";
import AppHeader from "@/shared/layout/app-header";

export default function InviteCodePage() {
  return (
    <div className="bg-background-primary flex flex-1 flex-col">
      <AppHeader nested centered divider={false} title="초대 코드 입력" />
      <InviteCodeForm />
    </div>
  );
}
