# 모락 (Morak) — Client

모두 모이면 즐겁다. 같은 목표를 가진 사람들이 챌린지를 만들고 함께 인증하는 자기계발 서비스입니다.
화면은 Next.js 웹으로 만들고, Expo 앱이 이 웹을 WebView로 띄워 스토어에 배포합니다.

## 레포 구조

pnpm 워크스페이스 + Turborepo 모노레포입니다.

```
apps/
├── web/        # @morak/web  — Next.js 웹 (모든 화면, BFF)
└── app/        # @morak/app  — Expo 앱 껍데기 (WebView + 네이티브 기능)
packages/
└── bridge/     # @morak/bridge — 웹 ↔ 앱 브릿지 메시지 타입 (양쪽이 함께 import)
docs/           # 설계·가이드 문서
```

## 기술 스택

| 영역                        | 기술                                             |
| --------------------------- | ------------------------------------------------ |
| 웹                          | Next.js (App Router) + TypeScript                |
| 앱                          | Expo + react-native-webview                      |
| 서버 상태 / 클라이언트 상태 | TanStack Query / Zustand                         |
| API 연동                    | Orval (Swagger → 타입·Query 훅·MSW 목 생성)      |
| 목 서버                     | MSW                                              |
| 폼                          | React Hook Form + Zod                            |
| 디자인 시스템 / 스타일      | JDS (`@jects/jds`) + Tailwind CSS                |
| 모노레포                    | pnpm workspace + Turborepo                       |
| 코드 품질                   | ESLint, Prettier, Husky, lint-staged, commitlint |
| 커밋 작성                   | commitizen + cz-git (`pnpm commit`)              |

## 시작하기

Node.js 22.13 이상(`.nvmrc` 기준 24)과 pnpm이 필요합니다. pnpm 버전은 루트 `package.json`의 `packageManager`를 따릅니다.

```bash
corepack enable          # pnpm 사용 준비 (최초 1회)
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev:web             # 웹 개발 서버 (localhost:3000)
```

앱 껍데기를 실기기에서 띄우려면:

```bash
cp apps/app/.env.example apps/app/.env.local   # EXPO_PUBLIC_WEB_URL에 PC의 LAN IP 입력
pnpm dev:app
```

## 스크립트 (루트에서 실행)

| 명령                                | 설명                                    |
| ----------------------------------- | --------------------------------------- |
| `pnpm dev:web` / `pnpm dev:app`     | 웹 개발 서버 / Expo 개발 서버           |
| `pnpm build`                        | 웹 프로덕션 빌드                        |
| `pnpm lint`                         | 전체 패키지 ESLint                      |
| `pnpm typecheck`                    | 전체 패키지 타입 검사                   |
| `pnpm format` / `pnpm format:check` | Prettier 적용 / 검사                    |
| `pnpm api:generate`                 | `OPENAPI_URL`의 명세로 웹 API 코드 생성 |
| `pnpm commit`                       | 커밋 메시지를 선택형으로 작성           |

패키지를 추가할 때는 대상 앱을 지정합니다. 앱(Expo)에는 SDK와 맞는 버전을 고르는 `expo install`을 씁니다.

```bash
pnpm --filter @morak/web add <패키지>
cd apps/app && npx expo install <패키지>
```

## 웹 폴더 구조 (`apps/web/src`)

```
app/                      # 라우트만. page.tsx는 화면을 조립하고 얇게 둔다
├── (tabs)/               # 하단 탭바가 붙는 화면 (내 챌린지, 모집 중, 채팅, 마이페이지)
└── challenges/ …         # 탭바 없는 하위 화면
features/                 # 도메인별 코드. 도메인 개념(챌린지·인증·채팅 등)을 아는 코드
└── challenge/
    ├── components/       # 예) challenge-card.tsx
    ├── hooks/            # 도메인 API 훅 (생성 코드를 감싸거나 조합할 때)
    └── types.ts
mocks/                    # MSW 핸들러와 워커
shared/                   # 도메인과 상관없는 공통 코드
├── api/
│   ├── fetcher.ts        # 모든 API 호출이 거치는 fetch 래퍼 (Next /api BFF로 요청)
│   ├── query-client.ts
│   └── generated/        # Orval 생성 코드 (직접 수정 금지)
├── layout/               # 앱 뼈대: AppHeader, TabBar
├── native/               # 앱 껍데기와 통신하는 브릿지 (isApp, sendToApp, onAppMessage)
├── navigation/           # 앱 안 이동 기록 (헤더 뒤로가기 판단)
└── ui/                   # 범용 UI: SvgIconButton, icons/
```

어디에 둘지 헷갈리면 이 순서로 판단합니다.

1. 라우트 파일(page, layout)이면 `app/`
2. 챌린지·인증처럼 도메인 개념을 다루면 `features/<도메인>/` — 한 화면에서만 써도 여기에 둔다
3. 도메인을 모르는 UI·유틸이면 `shared/`

헤더는 화면마다 제목·뒤로가기·오른쪽 버튼이 달라서 레이아웃이 아니라 각 `page.tsx`에서 `<AppHeader />`로 렌더합니다.
JDS에 없는 아이콘은 Figma에서 SVG를 가져와 `shared/ui/icons/`에 두고, 버튼이 필요하면 `SvgIconButton`(JDS IconButton과 같은 스타일)에 넣습니다.

## API 연동 흐름

1. 백엔드 Swagger가 나오면 `apps/web/.env.local`의 `OPENAPI_URL`을 설정합니다.
2. `pnpm api:generate`로 타입, TanStack Query 훅, MSW 목을 생성합니다.
3. 백엔드 구현 전에는 `NEXT_PUBLIC_API_MOCKING=enabled`로 두고, 생성된 목 핸들러를 `src/mocks/handlers.ts`에 등록해 화면을 개발합니다.

## 문서

- [웹뷰 앱 가이드](docs/webview-app-guide.md): 앱 껍데기(Expo) 구조, 웹뷰 주의사항, 브릿지, 딥링크

## 협업 규칙

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따르며, 커밋할 때 commitlint가 자동으로 검사합니다.

형식을 외울 필요 없이 `git commit` 대신 아래 명령을 쓰면 종류·범위·제목·연결 이슈를 차례로 골라 작성할 수 있습니다.

```bash
git add .
pnpm commit
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

- **커밋 전**: 변경된 파일에 ESLint(웹), Prettier 자동 적용 (lint-staged)
- **커밋 메시지**: commitlint 검사
- **PR**: GitHub Actions에서 포맷, 린트, 타입(웹·앱·브릿지), 웹 빌드, 커밋 메시지, PR 제목 검사. 통과해야 main에 머지됩니다.
