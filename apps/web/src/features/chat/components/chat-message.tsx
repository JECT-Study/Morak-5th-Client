import { CircleAlert, Repeat, TriangleAlert } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/shared/ui/badge";

import { formatChatDate, formatChatTime } from "../format";
import type { ChatMessage, ChatSender, PendingMessage } from "../type";

/** 역할 배지. 참여자는 배지를 달지 않는다. TODO: 백엔드 역할 값이 확정되면 맞춘다(지금은 HOST만 확인). */
const roleLabel = (role: string | undefined) => {
  if (role === "HOST") return "방장";
  if (role && /SUB|VICE/.test(role)) return "부방장";
  return null;
};

/** 날짜 구분선(Figma "2026년 00월 00일") */
export function DateDivider({ createdAt }: { createdAt: string }) {
  return (
    <li className="text-body-xs font-body-normal text-fg-secondary py-2 text-center">
      <time dateTime={createdAt}>{formatChatDate(createdAt)}</time>
    </li>
  );
}

function MessageTime({ createdAt }: { createdAt: string }) {
  return (
    <time
      dateTime={createdAt}
      className="text-body-2xs font-body-normal text-fg-tertiary shrink-0 whitespace-nowrap"
    >
      {formatChatTime(createdAt)}
    </time>
  );
}

/** 프로필 사진. 없으면 기본 모락이(Figma Profile_img) */
function Avatar({ sender }: { sender: ChatSender | null }) {
  return (
    <span
      aria-hidden
      className="bg-surface-selected rounded-12 relative size-12 shrink-0 overflow-hidden"
    >
      {sender?.profileImageUrl ? (
        // TODO: 이미지 저장소 도메인이 정해지면 next.config의 images.remotePatterns에 등록하고 최적화를 켠다.
        <Image src={sender.profileImageUrl} alt="" fill unoptimized className="object-cover" />
      ) : (
        <Image
          src="/images/default-avatar.svg"
          alt=""
          width={39}
          height={45}
          className="absolute top-[5px] left-[4.5px]"
        />
      )}
    </span>
  );
}

const bubbleText = "text-body-lg font-body-normal break-all whitespace-pre-wrap";

/**
 * 다른 사람이 보낸 메시지. 같은 사람이 이어서 보내면(continued) 프로필·이름을 생략한다.
 * 스크린리더는 "이름: 내용, 시간" 순서로 읽는다.
 */
export function IncomingMessage({
  message,
  continued,
}: {
  message: ChatMessage;
  continued: boolean;
}) {
  const name = message.sender?.nickname ?? "알 수 없음";
  const role = roleLabel(message.sender?.role);
  return (
    // 이어 보낸 메시지는 목록 간격(24px)을 줄여 8px만 띄운다.
    <li className={`flex items-start gap-3 ${continued ? "-mt-4" : ""}`}>
      {continued ? (
        <span aria-hidden className="w-12 shrink-0" />
      ) : (
        <Avatar sender={message.sender} />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {!continued && (
          <p className="flex items-center gap-1">
            <span className="text-label-lg font-label-normal text-fg-primary leading-[1.2]">
              {name}
            </span>
            {role && (
              <Badge variant="neutral" size="sm" className="font-label-normal">
                {role}
              </Badge>
            )}
          </p>
        )}
        <div className="flex items-end gap-2.5">
          <p
            className={`bg-surface-secondary rounded-12 text-fg-primary max-w-57 p-2.5 ${bubbleText}`}
          >
            {continued && <span className="sr-only">{name}: </span>}
            {message.content ?? <span className="text-fg-quaternary">삭제된 메시지예요.</span>}
          </p>
          <MessageTime createdAt={message.createdAt} />
        </div>
      </div>
    </li>
  );
}

/** 내가 보낸(서버에 저장된) 메시지 */
export function OutgoingMessage({ message }: { message: ChatMessage }) {
  return (
    <li className="flex items-end justify-end gap-2">
      <MessageTime createdAt={message.createdAt} />
      <p className={`bg-surface-brand rounded-12 text-fg-inverse max-w-62 p-2.5 ${bubbleText}`}>
        <span className="sr-only">나: </span>
        {message.content}
      </p>
    </li>
  );
}

/**
 * 내가 보내는 중이거나 실패한 메시지(Figma 재 전송).
 * 실패하면 말풍선 왼쪽에 느낌표, 아래에 "재 전송" 버튼을 둔다.
 */
export function PendingOutgoingMessage({
  item,
  onRetry,
}: {
  item: PendingMessage;
  onRetry: () => void;
}) {
  const failed = item.status === "failed";
  return (
    <li className="flex flex-col items-end gap-2">
      <div className="flex items-end justify-end gap-2">
        {failed ? (
          <CircleAlert aria-hidden className="text-danger size-[18px] shrink-0" />
        ) : (
          <span className="text-body-2xs font-body-normal text-fg-quaternary">보내는 중</span>
        )}
        <p
          className={`bg-surface-brand rounded-12 text-fg-inverse max-w-62 p-2.5 ${bubbleText} ${
            failed ? "" : "opacity-60"
          }`}
        >
          {item.content}
        </p>
      </div>
      {failed && (
        <button
          type="button"
          onClick={onRetry}
          // 실패 이유를 버튼 이름에 함께 넣어, 스크린리더가 무엇을 다시 보내는지 알 수 있게 한다.
          aria-label={`${item.errorMessage ?? "보내지 못했어요."} 다시 보내기`}
          className="text-body-sm font-body-normal text-fg-secondary focus-visible:ring-line-focus rounded-4 flex items-center gap-1 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Repeat aria-hidden className="size-[18px]" />재 전송
        </button>
      )}
    </li>
  );
}

/**
 * 서버 안내(SYSTEM) 메시지. 판정 업무 경고는 Figma "판정 업무 경고 안내" 카드로 보여준다.
 * TODO: 시스템 메시지 종류(경고·퇴장 예정·조기 종료 등)를 구분하는 값이 생기면 내용 대신 그 값으로 나눈다.
 */
export function SystemMessage({ message }: { message: ChatMessage }) {
  const isWarning = message.content?.includes("경고") ?? false;
  return (
    <li className="bg-surface-caution-subtle text-fg-caution rounded-12 flex flex-col px-4 py-3">
      {isWarning && (
        <p className="text-body-sm font-body-strong flex items-center gap-1">
          <TriangleAlert aria-hidden className="size-4" />
          판정 업무 경고 안내
        </p>
      )}
      <p className="text-body-xs font-body-normal">{message.content}</p>
    </li>
  );
}
