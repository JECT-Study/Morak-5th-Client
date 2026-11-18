"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { IconButton } from "@/shared/ui/icon-button";

/** 백엔드가 받는 대표 사진 규격(ChallengeCoverImages): JPG·PNG·WEBP, 5MB 이하 */
const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

type CoverImagePickerProps = {
  value: File | null;
  onChange: (file: File | null) => void;
};

/**
 * 챌린지 만들기의 대표 사진(선택). 상세 상단 커버(281px) 비율에 맞춰 미리 보여 준다.
 * 앱(웹뷰)에서는 파일 선택이 기기 카메라·앨범 선택으로 열린다.
 * TODO: 만들기 화면 대표 사진 시안이 나오면 맞춘다.
 */
export default function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // 고른 파일의 미리보기 주소. 파일이 바뀌거나 화면을 떠나면 이전 주소를 해제한다.
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const pick = (file: File | undefined) => {
    // 같은 파일을 다시 골라도 change가 일어나도록 비운다.
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("JPG, PNG, WEBP 사진만 올릴 수 있어요.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("대표 사진은 5MB 이하로 올려 주세요.");
      return;
    }
    setError(null);
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-label-md font-label-normal text-fg-primary">
        대표 사진 (선택)
      </label>
      <div className="rounded-12 bg-surface-secondary relative aspect-[375/281] w-full overflow-hidden">
        {previewUrl ? (
          <>
            {/* 사용자가 고른 로컬 파일 미리보기라 next/image 최적화를 거치지 않는다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="고른 대표 사진" className="size-full object-cover" />
            <IconButton
              aria-label="대표 사진 지우기"
              size="sm"
              onClick={() => onChange(null)}
              className="bg-surface-primary/90 absolute top-2 right-2"
            >
              <X aria-hidden />
            </IconButton>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-fg-tertiary flex size-full flex-col items-center justify-center gap-2"
          >
            <ImagePlus aria-hidden className="size-7" />
            <span className="text-label-sm font-label-normal">사진 추가하기</span>
          </button>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-label-sm font-label-normal text-fg-tertiary self-end underline"
        >
          사진 바꾸기
        </button>
      )}
      {error && (
        <p role="alert" className="text-label-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
