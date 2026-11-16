import { Accordion } from "@/shared/ui/accordion";
import { Checkbox } from "@/shared/ui/checkbox";

/** 이용 안내 항목. 본문은 Figma "온보딩_이용안내 펼치기" 원문이다. */
export const GUIDES = [
  {
    value: "challenge",
    title: "챌린지 개설 및 참여 방법 안내",
    body: [
      "원하는 챌린지를 찾아 각오 한마디와 함께 지원해 보세요. 직접 목표와 인증 방법을 정해 공개로 팀원을 모집하거나, 비공개로 지인을 초대할 수도 있어요. 챌린지는 최소 7일, 방장을 포함해 공개는 3명, 비공개는 2명부터 시작해요.",
      "참여 후에는 팀이 정한 미션을 매일 수행하고 밤 11시 59분까지 사진으로 인증해 주세요. 팀원의 인증에 좋아요를 누르거나 팀 채팅에서 서로 응원할 수 있어요. 지원서를 제출하면 취소할 수 없고, 합류 후에도 자진 탈퇴할 수 없으니 기간과 규칙을 먼저 확인해 주세요.",
    ],
  },
  {
    value: "point",
    title: "포인트 습득 방법 안내",
    body: [
      "온보딩을 완료하면 10,000P를 드려요. 포인트를 거는 공개 챌린지에는 한 번에 1,000~5,000P를 걸고 지원할 수 있어요. 포인트가 없어도 비공개나 포인트 없는 공개 챌린지에는 지원할 수 있어요.",
      "매일 방문: 하루 첫 방문에 자동 출석하고 100P를 받아요.",
      "30일 연속 출석: 30일째에는 기본 100P 대신 총 3,000P를 받아요.",
      "광고 시청: 끝까지 보면 한 편당 500P, 하루 최대 5회까지 받을 수 있어요.",
    ],
  },
  {
    value: "settlement",
    title: "팀 정산·모락이·메달 안내",
    body: [
      "매일의 인증이 모여 팀의 결과가 돼요. 팀 달성률은 팀 전체가 해야 했던 인증 중 성공한 인증의 비율이에요. 예를 들어 팀 인증 70회 중 63회를 성공하면 팀 달성률은 90%예요. 모두 인증해도 팀원의 실패로 반환량이 달라질 수 있으며, 개인 실패 누적으로 퇴장하면 건 포인트는 돌려받지 못해요. 공개 챌린지가 인원 미달로 조기 종료되면 남은 참여자는 본인의 인증 성공률로 정산하고, 추가 보상 없이 최대 전액까지만 받아요.",
      "나의 실천은 프로필에도 쌓여요. 모락이는 내가 해야 했던 인증 중 성공한 비율에 따라 다섯 가지 상태로 달라져요. 퇴장 없이 예정 기간을 끝까지 참여하면 완주 횟수가 쌓이고, 누적 횟수에 따라 메달을 받아요.",
    ],
  },
] as const;

export type GuideValue = (typeof GUIDES)[number]["value"];

type GuideStepProps = {
  /** 읽고 확인한 항목 */
  confirmed: GuideValue[];
  onConfirmChange: (value: GuideValue, checked: boolean) => void;
};

/**
 * 온보딩 이용 안내(Figma "온보딩_이용안내"). 각 항목을 펼쳐 읽고 본문 아래 체크로 확인한다.
 * 모든 항목을 확인해야 다음으로 넘어갈 수 있다(버튼은 OnboardingFlow가 막는다).
 * 확인은 제목 앞 체크박스나 펼친 본문 아래 체크박스 어느 쪽으로 해도 된다(둘은 같은 값).
 * 제목 앞 체크박스는 펼치기 버튼 안이 아니라 옆에 둔다(버튼 안에 다른 컨트롤을 넣을 수 없어서).
 */
export default function GuideStep({ confirmed, onConfirmChange }: GuideStepProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-md font-label-normal text-fg-secondary">
        함께 도전하기 전, 이용 방법을 확인해 주세요.
        <br />각 항목을 모두 체크해야 다음으로 넘어갈 수 있어요.
      </p>
      <p className="text-body-sm font-body-normal text-fg-secondary">
        각 제목을 눌러 접기·펼치기 / 내용은 아래로 스크롤
      </p>

      <Accordion type="multiple" className="flex flex-col gap-3">
        {GUIDES.map(({ value, title, body }) => {
          const done = confirmed.includes(value);
          return (
            <Accordion.Item
              key={value}
              value={value}
              className="border-line bg-surface-primary rounded-8 border p-4"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  aria-label={`${title} 확인했어요`}
                  checked={done}
                  onCheckedChange={(checked) => onConfirmChange(value, checked === true)}
                />
                <div className="min-w-0 flex-1">
                  <Accordion.Trigger className="text-label-md font-label-strong min-h-0 gap-2 py-0">
                    {title}
                  </Accordion.Trigger>
                </div>
              </div>
              <Accordion.Content className="flex flex-col gap-1 pt-2 pb-0">
                <div className="text-body-2xs font-body-normal text-fg-secondary">
                  {body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Checkbox
                    aria-label={`${title} 내용을 읽고 확인했어요`}
                    checked={done}
                    onCheckedChange={(checked) => onConfirmChange(value, checked === true)}
                  />
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
}
