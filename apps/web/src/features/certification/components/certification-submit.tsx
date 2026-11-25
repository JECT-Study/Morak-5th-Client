"use client";

import { Camera, ImageIcon, ImageOff } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { useChallenge } from "@/features/challenge/use-challenge";
import { ApiError } from "@/shared/api/client";
import { todayKst } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

import type { CertificationStatus } from "../types";
import { useCertificationFeed, useSubmitCertification } from "../use-certification";

/** 지금(KST)부터 오늘 24:00까지 남은 시간. 예) "3시간 12분 남음" */
const remainingText = () => {
  const [hour, minute] = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .split(":")
    .map(Number);
  const left = 24 * 60 - (hour * 60 + minute);
  const hours = Math.floor(left / 60);
  const minutes = left % 60;
  return hours > 0 ? `${hours}시간 ${minutes}분 남음` : `${minutes}분 남음`;
};

/** 내 인증 상태 라벨(위키 4.3). 판정 대기는 포인트 공개 그룹이면 "검수 중", 아니면 "보류" */
const statusText = (status: CertificationStatus, reviewedByStaff: boolean) => {
  if (status === "PENDING") return reviewedByStaff ? "검수 중" : "보류";
  if (status === "APPROVED" || status === "AUTO_APPROVED") return "승인";
  if (status === "REJECTED") return "거절";
  return "실패";
};

/** 서버가 준 실패 문구(업로드 가이드: 상태 코드로 나누고 error.message를 그대로 보인다). 연결 실패 등은 null */
const submitErrorMessage = (error: Error) => {
  if (error instanceof ApiError && [400, 403, 409, 413, 503].includes(error.status)) {
    return error.message || null;
  }
  return null;
};

/**
 * 오늘 인증 제출(위키 5.9, 피그마 "03_인증_제출" 와이어프레임).
 * 미션·마감까지 남은 시간 → 앨범·촬영 → 같은 화면에서 사진 확인(다시 찍기 / 제출하기) → 확인 모달 → 제출 완료.
 * 하루 1번이고 제출 후 수정·재제출이 없어, 이미 냈으면 상태 라벨만 보인다.
 * 자정이 지나면(누른 날짜와 오늘이 달라지면) 제출을 막는다. 서버도 같은 경우 DATE_MISMATCH로 거절한다.
 */
export default function CertificationSubmit() {
  const { id } = useParams<{ id: string }>();
  // 인증하기를 누른 날짜. 화면을 연 동안 바뀌지 않는다.
  const [certDate] = useState(todayKst);
  const challenge = useChallenge(id);
  const feed = useCertificationFeed(id, certDate);
  const submit = useSubmitCertification(id);

  // 고른 사진과 미리보기 주소(기기 안 임시 주소). 바꾸거나 화면을 떠나면 주소를 해제한다.
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [closed, setClosed] = useState(false);
  const [remaining, setRemaining] = useState(remainingText);
  const albumRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // 1분마다 남은 시간을 고치고, 자정을 넘기면 제출을 막는다.
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(remainingText());
      if (todayKst() !== certDate) setClosed(true);
    }, 30_000);
    return () => clearInterval(timer);
  }, [certDate]);

  useEffect(
    () => () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    [],
  );

  const pickPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 사진을 다시 골라도 바뀌게
    if (!file) return;
    submit.reset();
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    setPhoto({ file, url });
  };

  const send = () => {
    setConfirming(false);
    if (!photo) return;
    submit.mutate(
      { image: photo.file, certDate },
      {
        onError: (error) => {
          if (!(error instanceof ApiError)) return;
          if (error.code === "CERTIFICATION_DATE_MISMATCH") setClosed(true);
          // 이미 냈거나(다른 기기) 챌린지가 진행 중이 아니게 됐으면 다시 받아 화면을 맞춘다.
          if (error.status === 409) {
            void feed.refetch();
            void challenge.refetch();
          }
        },
      },
    );
  };

  if (challenge.isPending || feed.isPending) return <CertificationSkeleton />;

  if (challenge.error || !challenge.data) {
    return (
      <Message title="정보를 불러오지 못했어요.">
        <Button variant="outline" size="md" onClick={() => challenge.refetch()}>
          다시 시도
        </Button>
      </Message>
    );
  }

  const { title, commonMission, status, pointAmount, visibility } = challenge.data;
  // 포인트를 건 공개 챌린지는 운영진이, 나머지는 방장·부방장이 판정한다(위키 5.10).
  const reviewedByStaff = pointAmount > 0 && visibility === "PUBLIC";
  const mine = feed.data?.items.find((item) => item.mine) ?? submit.data ?? null;
  // 참여 중이 아니면(403) 다시 시도해도 같아서 버튼을 숨기고 서버 문구만 보인다.
  const forbidden =
    submit.error instanceof ApiError && submit.error.status === 403 ? submit.error : null;
  const canSubmit = !mine && status === "IN_PROGRESS" && !closed && !forbidden;

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 px-4 pt-4 pb-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-title-1 font-title text-fg-primary break-keep">{title}</h2>
          <p className="text-body-sm font-body-normal text-fg-secondary break-keep">
            미션: {commonMission}
          </p>
          {/* 아직 낼 수 있을 때만 마감까지 남은 시간을 보인다 */}
          {!mine && !closed && (
            <p className="text-label-md font-label-strong text-fg-brand-strong">
              오늘 23:59까지 · {remaining}
            </p>
          )}
        </header>

        {mine ? (
          <SubmittedView
            status={mine.status}
            imageUrl={mine.imageUrl}
            reviewedByStaff={reviewedByStaff}
          />
        ) : forbidden ? (
          <Message title={forbidden.message || "참여 중인 챌린지에서만 인증할 수 있어요."} />
        ) : status !== "IN_PROGRESS" ? (
          <Message title="진행 중인 챌린지에서만 인증할 수 있어요." />
        ) : closed ? (
          <Message title="오늘 인증 시간이 지났어요" description="미제출은 실패로 기록돼요." />
        ) : (
          <>
            <div className="bg-surface-secondary rounded-16 relative flex aspect-square w-full items-center justify-center overflow-hidden">
              {photo ? (
                // 고른 사진 미리보기(기기 안의 임시 주소라 최적화하지 않는다)
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt="고른 인증 사진" className="size-full object-cover" />
              ) : (
                <p className="text-body-sm font-body-normal text-fg-tertiary px-6 text-center break-keep">
                  앨범에서 고르거나 지금 찍어서 인증해 주세요
                </p>
              )}
              {submit.isPending && (
                <div className="bg-surface-primary/70 absolute inset-0 flex items-center justify-center">
                  <Spinner size={48} label="사진을 올리는 중" />
                </div>
              )}
            </div>

            {submit.isError && (
              <p role="alert" className="text-body-sm font-body-normal text-danger break-keep">
                {submitErrorMessage(submit.error) ??
                  "사진을 올리지 못했어요. 연결을 확인하고 다시 시도해 주세요. 사진은 그대로 남아 있어요."}
              </p>
            )}

            <p className="text-body-sm font-body-normal text-fg-tertiary">
              하루 1번 제출 · 제출 후 수정·재제출 불가
            </p>
          </>
        )}
      </div>

      {canSubmit && (
        <div className="bg-background-primary sticky bottom-0 flex gap-2 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          {photo ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                disabled={submit.isPending}
                onClick={() => cameraRef.current?.click()}
              >
                다시 찍기
              </Button>
              <Button
                className="flex-1"
                disabled={submit.isPending}
                onClick={() => setConfirming(true)}
              >
                {submit.isError ? "다시 시도" : "제출하기"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="subtle" className="flex-1" onClick={() => albumRef.current?.click()}>
                <ImageIcon aria-hidden />
                앨범
              </Button>
              <Button className="flex-1" onClick={() => cameraRef.current?.click()}>
                <Camera aria-hidden />
                촬영
              </Button>
            </>
          )}
        </div>
      )}

      <input
        ref={albumRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={pickPhoto}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={pickPhoto}
      />

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="인증을 제출할까요?"
        description="제출하면 수정하거나 다시 낼 수 없어요."
        cancelLabel="취소"
        confirmLabel="제출"
        onConfirm={send}
      />
    </main>
  );
}

function SubmittedView({
  status,
  imageUrl,
  reviewedByStaff,
}: {
  status: CertificationStatus;
  imageUrl: string | null;
  reviewedByStaff: boolean;
}) {
  return (
    <section aria-label="오늘 인증" className="flex flex-col gap-4">
      <div className="bg-surface-secondary rounded-16 relative aspect-square w-full overflow-hidden">
        {imageUrl ? (
          // 서명 주소(5분 유효)라 최적화하지 않는다
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="내 오늘 인증 사진" className="size-full object-cover" />
        ) : (
          <div className="text-fg-tertiary flex size-full flex-col items-center justify-center gap-2">
            <ImageOff aria-hidden className="size-8" />
            <p className="text-body-sm font-body-normal">사진을 불러오지 못했어요</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-title-2 font-title text-fg-primary">
          제출했어요 · {statusText(status, reviewedByStaff)}
        </p>
        {status === "PENDING" && (
          <p className="text-body-sm font-body-normal text-fg-secondary break-keep">
            {reviewedByStaff
              ? "운영진이 내일 판정해요."
              : "방장이 내일 정오까지 판정하고, 판정하지 않으면 자동으로 승인돼요."}
          </p>
        )}
        <p className="text-body-sm font-body-normal text-fg-tertiary">
          판정 전 사진은 팀 피드에 보이지 않아요.
        </p>
      </div>
      <Button asChild fullWidth>
        <Link href="/">홈으로</Link>
      </Button>
    </section>
  );
}

function Message({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-title-1 font-title text-fg-primary break-keep">{title}</p>
      {description && (
        <p className="text-body-sm font-body-normal text-fg-tertiary break-keep">{description}</p>
      )}
      {children}
    </div>
  );
}

function CertificationSkeleton() {
  return (
    <main aria-busy="true" aria-label="불러오는 중" className="flex flex-col gap-4 p-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-5 w-56" />
      <Skeleton className="rounded-16 aspect-square w-full" />
    </main>
  );
}
