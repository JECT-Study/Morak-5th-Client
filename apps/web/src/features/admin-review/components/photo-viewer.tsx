"use client";

import { Dialog } from "radix-ui";

/**
 * 원본 사진 열람. 작은 사진을 누르면 화면 가득 확대해서 규칙과 비교할 수 있게 한다(위키 D-2 "사진 확대").
 * 사진 주소는 짧게 유효한 서명 주소라 새 탭으로 열지 않고 같은 화면에서 보여 준다.
 */
export default function PhotoViewer({ urls }: { urls: string[] }) {
  if (urls.length === 0) {
    return (
      <div className="border-line rounded-6 text-body-md text-fg-tertiary flex min-h-64 items-center justify-center border border-dashed p-6 text-center">
        표시할 원본 사진이 없어요.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {urls.map((url, index) => (
        <Dialog.Root key={url}>
          <Dialog.Trigger
            className="block cursor-zoom-in"
            aria-label={`인증 사진 ${index + 1} 크게 보기`}
          >
            {/* 사진 저장소 주소가 설정에 따라 달라 next/image 대신 원본 img를 쓴다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`인증 사진 ${index + 1}`}
              className="border-line-subtle rounded-6 max-h-[480px] w-full border object-contain"
            />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />
            <Dialog.Content className="fixed inset-4 z-50 flex items-center justify-center outline-none">
              <Dialog.Title className="sr-only">{`인증 사진 ${index + 1}`}</Dialog.Title>
              <Dialog.Description className="sr-only">
                사진을 확인한 뒤 닫기를 누르거나 바깥을 눌러 돌아가세요.
              </Dialog.Description>
              <Dialog.Close className="absolute inset-0 cursor-zoom-out" aria-label="닫기" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`인증 사진 ${index + 1} 원본`}
                className="relative h-full w-full object-contain"
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
}
