"use client";

import { BlockButton, Checkbox } from "@jects/jds";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { AuthApiError, agreeToTerms } from "../onboarding-api";
import type { TermsAgreementsRequest } from "../types";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [agreed, setAgreed] = useState<TermsAgreementsRequest>(NONE_AGREED);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAgreed = TERMS.every(({ key }) => agreed[key]);
  const someAgreed = TERMS.some(({ key }) => agreed[key]);
  const requiredAgreed = TERMS.every(({ key, required }) => !required || agreed[key]);

  const toggleAll = (checked: boolean) =>
    setAgreed(Object.fromEntries(TERMS.map(({ key }) => [key, checked])) as TermsAgreementsRequest);

  const goToOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    router.replace("/onboarding");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await agreeToTerms(agreed);
      await goToOnboarding();
    } catch (cause) {
      // 다른 탭 등에서 이미 동의했다면 그대로 온보딩으로 넘어간다.
      if (cause instanceof AuthApiError && cause.code === "USER_001") {
        await goToOnboarding();
        return;
      }
      setError("동의를 저장하지 못했어요. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          aria-describedby={undefined}
          className="bg-surface-shallow border-stroke-subtle rounded-t-16 fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[767px] flex-col gap-4 border-t px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_0_4px_rgba(27,28,33,0.08),0_3px_8px_rgba(27,28,33,0.12),0_8px_16px_rgba(27,28,33,0.16)]"
        >
          <div aria-hidden className="mx-auto h-1 w-20 rounded-[2px] bg-[#bab9bf]" />
          <Dialog.Title className="text-title-1 font-title-subtle text-object-bolder">
            시작하기 전에 동의해 주세요
          </Dialog.Title>

          <div className="border-stroke-subtle rounded-6 border px-3 py-2.5">
            <Checkbox
              size="lg"
              label="전체동의"
              checked={allAgreed ? true : someAgreed ? "indeterminate" : false}
              onCheckedChange={(checked) => toggleAll(checked === true)}
            />
          </div>

          <ul className="flex flex-col gap-4 px-3 py-1">
            {TERMS.map(({ key, label, viewable }) => (
              <li key={key} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Checkbox
                    size="md"
                    label={label}
                    checked={agreed[key]}
                    onCheckedChange={(checked) =>
                      setAgreed((prev) => ({ ...prev, [key]: checked === true }))
                    }
                  />
                </div>
                {viewable && (
                  // TODO: 약관 본문이 확정되면 해당 약관 문서로 이동한다.
                  <button
                    type="button"
                    className="text-label-sm text-object-alternative shrink-0 underline"
                  >
                    보기
                  </button>
                )}
              </li>
            ))}
          </ul>

          {error && (
            <p role="alert" className="text-label-sm text-(--color-semantic-feedback-destructive)">
              {error}
            </p>
          )}

          <BlockButton
            size="lg"
            hierarchy="accent"
            disabled={!requiredAgreed || submitting}
            onClick={() => void handleSubmit()}
          >
            동의하고 계속하기
          </BlockButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
