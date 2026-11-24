import Link from "next/link";

import { Button } from "@/shared/ui/button";

/** 운영진이 아니거나 로그인하지 않은 사용자에게 보이는 안내. */
export default function AccessDenied({ unauthenticated }: { unauthenticated: boolean }) {
  return (
    <section className="border-line-subtle bg-surface-primary rounded-8 flex flex-col items-start gap-3 border p-6">
      <h1 className="text-title-2 font-title text-fg-primary">
        {unauthenticated ? "로그인이 필요해요" : "운영진만 사용할 수 있어요"}
      </h1>
      <p className="text-body-md font-body-normal text-fg-secondary">
        {unauthenticated
          ? "운영진 계정으로 로그인한 뒤 다시 열어 주세요."
          : "이 화면은 운영진 계정으로만 열 수 있어요."}
      </p>
      <Button asChild size="md" variant="outline">
        <Link href="/login">로그인 화면으로</Link>
      </Button>
    </section>
  );
}
