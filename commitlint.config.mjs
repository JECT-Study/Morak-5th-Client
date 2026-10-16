/**
 * 커밋 메시지 규칙: <type>(<scope>): <subject>
 * 예) feat(auth): 로그인 BFF 라우트 추가
 *
 * `npm run commit`을 실행하면 아래 prompt 설정으로 커밋 메시지를 선택해서 작성할 수 있다(cz-git).
 *
 * @type {import("cz-git").UserConfig}
 */
const types = [
  { value: "feat", name: "feat:     새 기능" },
  { value: "fix", name: "fix:      버그 수정" },
  { value: "design", name: "design:   UI·스타일 변경" },
  { value: "refactor", name: "refactor: 동작 변화 없는 코드 개선" },
  { value: "perf", name: "perf:     성능 개선" },
  { value: "test", name: "test:     테스트 추가·수정" },
  { value: "docs", name: "docs:     문서" },
  { value: "style", name: "style:    포맷팅 등 코드 의미 변화 없음" },
  { value: "chore", name: "chore:    빌드·설정·패키지" },
  { value: "ci", name: "ci:       CI 설정" },
  { value: "revert", name: "revert:   되돌리기" },
];

const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", types.map((type) => type.value)],
    // 한글 제목을 허용하기 위해 대소문자 규칙은 끈다.
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
  },
  prompt: {
    messages: {
      type: "커밋 종류를 고르세요:",
      scope: "변경 범위를 고르세요 (선택):",
      customScope: "변경 범위를 입력하세요:",
      subject: "제목을 입력하세요 (무엇을 했는지 짧게):\n",
      body: '자세한 설명을 입력하세요 (선택, 줄바꿈은 "|"):\n',
      breaking: '호환되지 않는 변경 사항 (선택, 줄바꿈은 "|"):\n',
      footerPrefixesSelect: "연결할 이슈를 고르세요 (선택):",
      customFooterPrefix: "이슈 키워드를 입력하세요:",
      footer: "이슈 번호를 입력하세요 (예: #12):\n",
      confirmCommit: "이 메시지로 커밋할까요?",
    },
    types,
    scopes: ["auth", "challenge", "feed", "chat", "point", "profile", "ui", "api", "config"],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: "bottom",
    customScopesAlias: "직접 입력",
    emptyScopesAlias: "범위 없음",
    issuePrefixes: [
      { value: "close", name: "close:   이슈 완료" },
      { value: "ref", name: "ref:     이슈 참고" },
    ],
    allowEmptyIssuePrefix: true,
    emptyIssuePrefixAlias: "연결 안 함",
    customIssuePrefixAlias: "직접 입력",
    skipQuestions: ["breaking"],
    maxHeaderLength: 100,
  },
};

export default config;
