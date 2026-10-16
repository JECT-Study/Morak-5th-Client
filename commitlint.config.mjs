/**
 * 커밋 메시지 규칙: <type>(<scope>): <subject>
 * 예) feat(auth): 로그인 BFF 라우트 추가
 *
 * @type {import("@commitlint/types").UserConfig}
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새 기능
        "fix", // 버그 수정
        "design", // UI·스타일 변경
        "refactor", // 동작 변화 없는 코드 개선
        "perf", // 성능 개선
        "test", // 테스트 추가·수정
        "docs", // 문서
        "style", // 포맷팅 등 코드 의미 변화 없음
        "chore", // 빌드·설정·패키지
        "ci", // CI 설정
        "revert", // 되돌리기
      ],
    ],
    // 한글 제목을 허용하기 위해 대소문자 규칙은 끈다.
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
  },
};

export default config;
