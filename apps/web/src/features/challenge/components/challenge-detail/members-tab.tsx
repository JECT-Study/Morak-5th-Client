import { ContentBadge, Divider, Icon, type ContentBadgeStyle } from "@jects/jds";
import { Fragment } from "react";

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
const ROLE_BADGE: Record<MemberRole, { label: string; badgeStyle: ContentBadgeStyle }> = {
  owner: { label: "방장", badgeStyle: "solid" },
  subOwner: { label: "부방장", badgeStyle: "alpha" },
  member: { label: "참여자", badgeStyle: "outlined" },
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
              {index > 0 && <Divider />}
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
          <ContentBadge hierarchy="accent" size="sm" badgeStyle={badge.badgeStyle}>
            {badge.label}
          </ContentBadge>
        </div>
      </div>
      <Icon name="chevron-right" size="md" aria-hidden className="text-object-alternative" />
    </li>
  );
}
