# 모락 (Morak) — Client

모두 모이면 즐겁다. 같은 목표를 가진 사람들이 챌린지를 만들고 함께 인증하는 자기계발 웹앱입니다.

## 기술 스택

| 영역                        | 기술                                             |
| --------------------------- | ------------------------------------------------ |
| 프레임워크                  | Next.js (App Router) + TypeScript                |
| 서버 상태 / 클라이언트 상태 | TanStack Query / Zustand                         |
| API 연동                    | Orval (Swagger → 타입·Query 훅·MSW 목 생성)      |
| 목 서버                     | MSW                                              |
| 폼                          | React Hook Form + Zod                            |
| 스타일                      | Tailwind CSS                                     |
| 코드 품질                   | ESLint, Prettier, Husky, lint-staged, commitlint |
| 커밋 작성                   | commitizen + cz-git (`npm run commit`)           |

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

Node.js 20.9 이상이 필요합니다(`.nvmrc` 기준 24).

## 스크립트

| 명령                              | 설명                                 |
| --------------------------------- | ------------------------------------ |
| `npm run dev`                     | 개발 서버                            |
| `npm run build`                   | 프로덕션 빌드                        |
| `npm run lint` / `lint:fix`       | ESLint 검사 / 자동 수정              |
| `npm run format` / `format:check` | Prettier 적용 / 검사                 |
| `npm run typecheck`               | 타입 검사                            |
| `npm run api:generate`            | `OPENAPI_URL`의 명세로 API 코드 생성 |
| `npm run commit`                  | 커밋 메시지를 선택형으로 작성        |

## 폴더 구조

```
src/
├── app/                  # 라우트, 레이아웃, Providers
├── mocks/                # MSW 핸들러와 워커
└── shared/
    └── api/
        ├── fetcher.ts    # 모든 API 호출이 거치는 fetch 래퍼 (Next /api BFF로 요청)
        ├── query-client.ts
        └── generated/    # Orval 생성 코드 (직접 수정 금지)
```

## API 연동 흐름

1. 백엔드 Swagger가 나오면 `.env.local`의 `OPENAPI_URL`을 설정합니다.
2. `npm run api:generate`로 타입, TanStack Query 훅, MSW 목을 생성합니다.
3. 백엔드 구현 전에는 `NEXT_PUBLIC_API_MOCKING=enabled`로 두고, 생성된 목 핸들러를 `src/mocks/handlers.ts`에 등록해 화면을 개발합니다.

## 문서

- [웹뷰 앱 가이드](docs/webview-app-guide.md): 앱 껍데기(Expo) 구조, 웹뷰 주의사항, 브릿지, 딥링크

## 협업 규칙

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따르며, 커밋할 때 commitlint가 자동으로 검사합니다.

형식을 외울 필요 없이 `git commit` 대신 아래 명령을 쓰면 종류·범위·제목·연결 이슈를 차례로 골라 작성할 수 있습니다.

```bash
git add .
npm run commit
```

```
<type>(<scope>): <제목>

feat(auth): 로그인 BFF 라우트 추가
fix(feed): 인증 사진 업로드 실패 시 재시도 버튼 표시
```

| type       | 용도                          |
| ---------- | ----------------------------- |
| `feat`     | 새 기능                       |
| `fix`      | 버그 수정                     |
| `design`   | UI·스타일 변경                |
| `refactor` | 동작 변화 없는 코드 개선      |
| `perf`     | 성능 개선                     |
| `test`     | 테스트                        |
| `docs`     | 문서                          |
| `style`    | 포맷팅 등 의미 변화 없는 수정 |
| `chore`    | 빌드·설정·패키지              |
| `ci`       | CI 설정                       |
| `revert`   | 되돌리기                      |

### 브랜치

- `main`: 배포 브랜치
- 작업 브랜치: `<type>/<이슈번호>-<요약>` 예) `feat/12-verification-upload`
- 작업은 이슈 생성 → 브랜치 → PR 순서로 진행하고, PR 제목도 커밋 규칙을 따릅니다.

### 자동 검사

- **커밋 전**: 변경된 파일에 ESLint, Prettier 자동 적용 (lint-staged)
- **커밋 메시지**: commitlint 검사
- **PR**: GitHub Actions에서 포맷, 린트, 타입, 빌드, 커밋 메시지, PR 제목 검사
