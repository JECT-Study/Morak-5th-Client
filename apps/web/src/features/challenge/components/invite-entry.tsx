"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { TextField } from "@/shared/ui/text-field";

import { fetchChallengeByCode } from "../challenge-api";
import { rememberInviteCode } from "../invite-code";

/** 초대 코드 조회 실패 문구(위키 5.3, FE-O4). 링크로 들어온 경우 없는 코드는 "유효하지 않은 접근이에요". */
const lookupErrorMessage = (error: Error, fromLink: boolean) => {
  if (error instanceof ApiError) {
    if (error.status === 404)
      return fromLink ? "유효하지 않은 접근이에요" : "유효하지 않은 코드입니다";
    if (error.status === 410) return "이미 종료된 챌린지입니다";
    if (error.status === 429) return "코드를 여러 번 잘못 입력했어요. 잠시 뒤 다시 시도해 주세요.";
    if (error.status === 401) return "로그인한 뒤 초대 코드로 들어올 수 있어요.";
  }
  return "정보를 불러오지 못했어요. 다시 시도해 주세요.";
};

/**
 * 초대 코드로 챌린지를 찾아 상세로 보낸다(합류하지 않는다, 위키 5.3).
 * 찾으면 코드를 기억해 두고(비공개 상세 조회·신청에 쓴다) 받은 상세를 캐시에 넣은 뒤 상세로 바꿔 간다.
 */
function useInviteLookup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => fetchChallengeByCode(code),
    onSuccess: (challenge, code) => {
      const id = String(challenge.id);
      rememberInviteCode(id, code);
      queryClient.setQueryData(["challenges", id], challenge);
      router.replace(`/challenges/${id}`);
    },
  });
}

/** 홈 우상단 "초대코드 입력"으로 오는 화면. 코드 길이는 정해지지 않아 길이 검사는 하지 않는다. */
export function InviteCodeForm() {
  const [code, setCode] = useState("");
  const lookup = useInviteLookup();
  const trimmed = code.trim();
  const busy = lookup.isPending || lookup.isSuccess;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed || busy) return;
    lookup.mutate(trimmed);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-6 px-4 pt-4">
      <p className="text-body-md font-body-normal text-fg-secondary break-keep">
        방장에게 받은 초대 코드를 입력하면 챌린지 상세에서 참여를 신청할 수 있어요.
      </p>
      <TextField status={lookup.isError ? "error" : "default"} disabled={busy}>
        <TextField.Label>초대 코드</TextField.Label>
        <TextField.Input
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (lookup.isError) lookup.reset();
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="초대 코드를 입력해 주세요"
        />
        {lookup.isError && (
          <TextField.Footer>
            <TextField.Helper>{lookupErrorMessage(lookup.error, false)}</TextField.Helper>
          </TextField.Footer>
        )}
      </TextField>
      <div className="mt-auto pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <Button type="submit" fullWidth disabled={!trimmed || busy}>
          {busy ? "찾는 중이에요" : "확인"}
        </Button>
      </div>
    </form>
  );
}

/** 초대 링크(/invite/{code})로 들어오면 바로 코드를 확인해 상세로 보낸다. */
export function InviteLink() {
  const { code } = useParams<{ code: string }>();
  const lookup = useInviteLookup();
  const { mutate } = lookup;
  const started = useRef(false);

  useEffect(() => {
    // 개발 모드에서 effect가 두 번 돌아도 한 번만 조회한다(여러 번 틀리면 잠기기 때문).
    if (started.current) return;
    started.current = true;
    mutate(decodeURIComponent(code));
  }, [code, mutate]);

  if (!lookup.isError) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <Spinner size={40} label="초대 정보를 확인하는 중" />
      </main>
    );
  }

  const needsLogin = lookup.error instanceof ApiError && lookup.error.status === 401;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-body-md font-body-normal text-fg-tertiary break-keep">
        {lookupErrorMessage(lookup.error, true)}
      </p>
      <Button asChild variant="outline" size="md">
        {needsLogin ? <Link href="/login">로그인하기</Link> : <Link href="/">홈으로</Link>}
      </Button>
    </main>
  );
}
