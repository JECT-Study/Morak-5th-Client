"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { ApiError } from "@/shared/api/client";
import BottomSheet from "@/shared/ui/bottom-sheet";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

import { useSetFlash } from "../flash";
import { useProfileImage } from "../use-profile-image";
import { ProfileAvatar } from "./profile-sections";

const SAVE_FAILED = "사진을 저장하지 못했어요. 다시 시도해 주세요.";

/** 사진 형식·크기 오류(400·413)는 서버 문구를, 나머지는 위키 실패 문구를 보인다. */
const errorText = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof ApiError && [400, 413].includes(error.status) && error.message) {
    return error.message;
  }
  return SAVE_FAILED;
};

/**
 * 마이페이지 프로필 사진 변경(위키 6.3). 사진을 누르면
 * - 사진이 없으면 바로 기기 사진 선택, 있으면 "사진 바꾸기 / 기본 이미지로 바꾸기" 시트
 * - 사진을 고르면 미리보기 시트에서 취소 / 적용. 저장 중에는 버튼을 막는다.
 * - 성공하면 시트를 닫고 "프로필 사진이 변경되었어요.", 실패하면 시트에 실패 문구를 두고 다시 적용할 수 있다.
 * TODO: 사진 접근 거부 안내("사진을 선택하려면…")는 앱 웹뷰에서 거부를 알 수 있게 되면 붙인다(웹 파일 선택은 거부를 알려 주지 않는다).
 */
export default function ProfilePhotoEditor({
  userId,
  imageUrl,
}: {
  userId: number;
  imageUrl: string | null;
}) {
  const setFlash = useSetFlash();
  const { change, remove } = useProfileImage(userId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // 고른 사진과 미리보기 주소(기기 안 임시 주소). 바꾸거나 닫으면 주소를 해제한다.
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const pickedUrlRef = useRef<string | null>(null);

  const releasePreview = () => {
    if (pickedUrlRef.current) URL.revokeObjectURL(pickedUrlRef.current);
    pickedUrlRef.current = null;
  };
  useEffect(() => releasePreview, []);

  const openPicker = () => inputRef.current?.click();

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 사진을 다시 골라도 바뀌게
    if (!file) return;
    setMenuOpen(false);
    change.reset();
    releasePreview();
    const url = URL.createObjectURL(file);
    pickedUrlRef.current = url;
    setPicked({ file, url });
  };

  const closePreview = () => {
    if (change.isPending) return;
    releasePreview();
    setPicked(null);
  };

  const apply = () => {
    if (!picked) return;
    change.mutate(picked.file, {
      onSuccess: () => {
        releasePreview();
        setPicked(null);
        setFlash("프로필 사진이 변경되었어요.");
      },
    });
  };

  const removePhoto = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        setMenuOpen(false);
        setFlash("프로필 사진이 변경되었어요.");
      },
    });

  return (
    <>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={() => {
          if (imageUrl) {
            remove.reset();
            setMenuOpen(true);
          } else openPicker();
        }}
        className="focus-visible:ring-line-focus relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none"
      >
        <ProfileAvatar imageUrl={imageUrl} />
        <span className="bg-surface-primary border-line text-fg-secondary absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border">
          <Camera aria-hidden className="size-3.5" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={pick}
      />

      <BottomSheet
        open={menuOpen}
        onOpenChange={(open) => !remove.isPending && setMenuOpen(open)}
        title="프로필 사진"
      >
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={openPicker} disabled={remove.isPending}>
            사진 바꾸기
          </Button>
          <Button variant="outline" fullWidth onClick={removePhoto} disabled={remove.isPending}>
            {remove.isPending ? "바꾸는 중이에요" : "기본 이미지로 바꾸기"}
          </Button>
          {remove.isError && (
            <p role="alert" className="text-label-sm font-label-normal text-danger text-center">
              {SAVE_FAILED}
            </p>
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        open={picked !== null}
        onOpenChange={(open) => !open && closePreview()}
        title="이 사진으로 바꿀까요?"
      >
        {picked && (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-surface-tertiary relative size-40 overflow-hidden rounded-full">
              {/* 기기 안의 임시 주소라 최적화하지 않는다 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={picked.url} alt="고른 프로필 사진" className="size-full object-cover" />
              {change.isPending && (
                <div className="bg-surface-primary/70 absolute inset-0 flex items-center justify-center">
                  <Spinner size={32} label="사진을 저장하는 중" />
                </div>
              )}
            </div>
            {change.isError && (
              <p role="alert" className="text-label-sm font-label-normal text-danger text-center">
                {errorText(change.error)}
              </p>
            )}
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closePreview}
                disabled={change.isPending}
              >
                취소
              </Button>
              <Button className="flex-1" onClick={apply} disabled={change.isPending}>
                {change.isError ? "다시 시도" : "적용"}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
