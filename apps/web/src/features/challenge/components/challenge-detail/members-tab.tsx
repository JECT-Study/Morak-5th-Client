import { ChevronRight } from "lucide-react";
import { Fragment, type ComponentProps } from "react";

import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";

export type MemberRole = "owner" | "subOwner" | "member";

export type ChallengeMember = {
  id: number;
  nickname: string;
  role: MemberRole;
  /** 로그인한 사용자 본인이면 이름 뒤에 "(나)"를 붙인다 */
  isMe?: boolean;
};

type MembersTabProps = {
  members: ChallengeMember[];
  memberCount: number;
  capacity: number;
};

/** 역할 배지: 방장은 채움, 부방장은 옅은 채움, 참여자는 테두리 */
const ROLE_BADGE: Record<
  MemberRole,
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  owner: { label: "방장", variant: "brand" },
  subOwner: { label: "부방장", variant: "subtle" },
  member: { label: "참여자", variant: "outline" },
};

/** 챌린지 상세 "팀원" 탭(Figma "팀원" + "member list"). 인원 수와 팀원 목록을 보여준다. */
export default function MembersTab({ members, memberCount, capacity }: MembersTabProps) {
  return (
    <div className="bg-surface-deep flex flex-col">
      <p className="bg-surface-standard text-label-lg flex items-center gap-2 px-6 py-4">
        <span className="font-label-bold text-object-boldest">팀원</span>
        <span className="font-label-subtle text-object-alternative">
          {memberCount}/{capacity}명
        </span>
      </p>

      <div className="p-4">
        <ul className="bg-surface-standard rounded-12 flex flex-col px-3 py-1">
          {members.map((member, index) => (
            <Fragment key={member.id}>
              {index > 0 && <Separator />}
              <MemberRow {...member} />
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}

// TODO: 팀원 프로필(또는 인증 기록) 화면이 정해지면 줄 전체를 링크로 바꾼다.
function MemberRow({ nickname, role, isMe }: ChallengeMember) {
  const badge = ROLE_BADGE[role];
  return (
    <li className="flex items-center gap-8 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden
          className="text-label-lg font-label-normal flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eae7fa] text-[#20252b]"
        >
          {nickname.charAt(0)}
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-label-lg font-label-normal text-object-boldest truncate">
            {nickname}
            {isMe && " (나)"}
          </span>
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        </div>
      </div>
      <ChevronRight aria-hidden className="text-fg-quaternary size-5 shrink-0" />
    </li>
  );
}
