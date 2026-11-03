import ScreenPlaceholder from "@/shared/layout/screen-placeholder";
import { BlockButton } from "@jects/jds";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <div className="pt-[env(safe-area-inset-top)]" />
      <ScreenPlaceholder name="로그인" />
      <BlockButton asChild size="lg">
        <Link href={"/api/auth/kakao"}>카카오로그인</Link>
      </BlockButton>
    </>
  );
}
