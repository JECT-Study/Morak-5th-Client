import { Accordion } from "@jects/jds";

/*
 * TODO: 본문은 화면정의서 온보딩 "세부 안내 내용" 원문으로 바꾼다.
 * 원문을 받기 전까지 프론트 위키(서비스 규칙)를 요약한 임시 문구를 쓴다.
 */
const GUIDES = [
  {
    value: "challenge",
    title: "챌린지 개설 및 참여 방법 안내",
    body: [
      "모집 중인 챌린지에 지원서를 보내고, 방장이 승인하면 참여가 확정돼요.",
      "직접 챌린지를 만들 수도 있어요. 동시에 참여할 수 있는 챌린지는 최대 5개예요.",
      "참여가 확정되면 매일 사진으로 인증하고, 팀 채팅에서 서로 응원할 수 있어요.",
    ],
  },
  {
    value: "point",
    title: "포인트 습득 방법 안내",
    body: [
      "처음 가입하면 10,000P를 드려요.",
      "광고를 보면 1회 500P(하루 최대 5회), 매일 처음 방문하면 100P를 받아요.",
      "포인트는 포인트를 거는 공개 챌린지에 참여할 때 사용해요.",
    ],
  },
  {
    value: "settlement",
    title: "팀 정산·모락이·메달 안내",
    body: [
      "챌린지가 끝나면 인증 결과에 따라 걸어 둔 포인트를 돌려받아요.",
      "인증을 꾸준히 할수록 마이페이지의 모락이가 자라요.",
      "챌린지를 완주하면 완주 횟수에 따라 메달을 받아요.",
    ],
  },
];

/** 온보딩 2단계: 이용 안내. 3개 항목을 이 화면 안에서 접고 펼친다. */
export default function GuideStep() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label-lg font-label-bold text-object-boldest">
        함께 도전하기 전, 이용 방법을 확인해 주세요.
      </p>
      <Accordion.Root type="multiple" isStretched>
        {GUIDES.map(({ value, title, body }) => (
          <Accordion.Item key={value} value={value}>
            <Accordion.Trigger>{title}</Accordion.Trigger>
            <Accordion.Content>
              <ul className="text-body-sm font-body-normal text-object-neutral flex list-disc flex-col gap-1 pl-5">
                {body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
