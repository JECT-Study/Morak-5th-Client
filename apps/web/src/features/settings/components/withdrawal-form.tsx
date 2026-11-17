"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";

import { useWithdraw } from "../use-account";

const NOTICES = [
  "진행 중이거나 시작을 기다리는 챌린지가 있으면 탈퇴할 수 없어요. 챌린지가 끝난 뒤 다시 시도해 주세요.",
  "탈퇴하면 닉네임·프로필 등 개인정보는 알아볼 수 없게 처리되고, 다시 되돌릴 수 없어요.",
  "모든 기기에서 로그아웃돼요.",
];

/**
 * 회원 탈퇴 안내와 최종 확인(위키 6.10). 시안이 없어 기존 컴포넌트로 임시 구성했다.
 * 안내를 확인했다는 체크를 해야 탈퇴 버튼이 켜진다.
 * TODO: 탈퇴 화면 시안·정책(O-3)이 정해지면 문구와 구성을 맞춘다.
 */
export default function WithdrawalForm() {
  const [confirmed, setConfirmed] = useState(false);
  const { withdraw, isPending, errorMessage } = useWithdraw();

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <section className="flex flex-col gap-3">
        <h2 className="text-title-2 font-title text-fg-primary">탈퇴하기 전에 확인해 주세요</h2>
        <ul className="text-body-md font-body-normal text-fg-secondary flex list-disc flex-col gap-2 pl-5">
          {NOTICES.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex">
          <Checkbox
            label="안내를 모두 확인했어요"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
        </div>
        {errorMessage && (
          <p role="alert" className="text-label-sm text-danger">
            {errorMessage}
          </p>
        )}
        <Button fullWidth disabled={!confirmed || isPending} onClick={withdraw}>
          탈퇴하기
        </Button>
      </div>
    </main>
  );
}
