"use client";

import { useState } from "react";

import BottomSheet from "@/shared/ui/bottom-sheet";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";

import type { TermsAgreementsRequest } from "../types";
import { useAgreeTerms } from "../use-agree-terms";

type TermKey = keyof TermsAgreementsRequest;

const TERMS: { key: TermKey; label: string; required: boolean; viewable: boolean }[] = [
  { key: "age14OrOlder", label: "[필수] 만 14세 이상이에요", required: true, viewable: false },
  { key: "serviceTermsAgreed", label: "[필수] 이용약관", required: true, viewable: true },
  { key: "privacyAgreed", label: "[필수] 개인정보 수집·이용", required: true, viewable: true },
  {
    key: "photoCollectionAgreed",
    label: "[필수] 인증 사진 수집·이용",
    required: true,
    viewable: true,
  },
  {
    key: "marketingAgreed",
    label: "[선택] 이벤트·혜택 알림 받기",
    required: false,
    viewable: false,
  },
];

const NONE_AGREED: TermsAgreementsRequest = {
  age14OrOlder: false,
  serviceTermsAgreed: false,
  privacyAgreed: false,
  photoCollectionAgreed: false,
  marketingAgreed: false,
};

/**
 * 약관 동의 시트(Figma "Sheet / 약관 동의 시트"). 가입 후 처음 한 번, 온보딩 전에 띄운다.
 * 동의해야 다음으로 갈 수 있으므로 바깥을 누르거나 Esc를 눌러도 닫히지 않는다.
 */
export default function TermsSheet() {
  const [agreed, setAgreed] = useState<TermsAgreementsRequest>(NONE_AGREED);
  const { agree, isPending, errorMessage } = useAgreeTerms();

  const allAgreed = TERMS.every(({ key }) => agreed[key]);
  const someAgreed = TERMS.some(({ key }) => agreed[key]);
  const requiredAgreed = TERMS.every(({ key, required }) => !required || agreed[key]);

  const toggleAll = (checked: boolean) =>
    setAgreed(Object.fromEntries(TERMS.map(({ key }) => [key, checked])) as TermsAgreementsRequest);

  return (
    // 동의해야 넘어갈 수 있으므로 바깥 누르기·Esc·끌어내리기로 닫히지 않게 한다.
    <BottomSheet open dismissible={false} title="시작하기 전에 동의해 주세요">
      {/* Checkbox가 inline 요소라 flex로 감싸야 체크 여부에 따라 줄 높이가 1px씩 바뀌지 않는다. */}
      <div className="border-line-subtle rounded-6 flex border px-3 py-2.5">
        <Checkbox
          label="전체동의"
          checked={allAgreed ? true : someAgreed ? "indeterminate" : false}
          onCheckedChange={(checked) => toggleAll(checked === true)}
        />
      </div>

      <ul className="flex flex-col gap-4 px-3 py-1">
        {TERMS.map(({ key, label, viewable }) => (
          <li key={key} className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1">
              <Checkbox
                label={label}
                checked={agreed[key]}
                onCheckedChange={(checked) =>
                  setAgreed((prev) => ({ ...prev, [key]: checked === true }))
                }
              />
            </div>
            {viewable && (
              // TODO: 약관 본문이 확정되면 해당 약관 문서로 이동한다.
              <button type="button" className="text-label-sm text-fg-tertiary shrink-0 underline">
                보기
              </button>
            )}
          </li>
        ))}
      </ul>

      {errorMessage && (
        <p role="alert" className="text-label-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button fullWidth disabled={!requiredAgreed || isPending} onClick={() => agree(agreed)}>
        동의하고 계속하기
      </Button>
    </BottomSheet>
  );
}
