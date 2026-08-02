# 소상공인 정부 지원금 큐레이터

정부 지원금 정보가 여러 기관 사이트에 흩어져 있어, 소상공인이 자신에게 맞는
지원금을 한눈에 파악하기 어려운 문제를 해결하는 서비스입니다.

## 프로젝트 요약

### 문제 제기

소상공인이 정부 지원금을 찾을 때, 정보가 정부24·소상공인시장진흥공단·지자체 등 여러
기관 사이트에 흩어져 있어 업종·지역·업력·직원 수 같은 본인 조건에 맞는 지원금을
검색·비교하기 어렵다. 자세한 문제 정의·사용자 시나리오는 [`docs/plan.md`](docs/plan.md) 참고.

### 주요 기능

1. **조건 매칭 + 정렬 추천** — 업종/지역/직원수/연매출/업력 조건으로 지원금을 매칭도순
   정렬해 보여주고, 마감임박순·지원금액순으로 재정렬 가능
2. **상세 정보 + 외부 신청 연결** — 자격 조건·필요 서류·신청 방법을 보여주고, 실제 신청은
   외부 기관 사이트로 연결
3. **지원금 데이터 자동 수집** — 기업마당 공식 Open API를 GitHub Actions cron으로 매일
   수집하고, PDF/HWP 첨부파일은 Gemini AI로 구조화 추출해 매칭 조건 커버리지를 보완

### 기술적 특징

- **스택**: React 19 + TypeScript + Vite(클라이언트) / Express 4 + TypeScript(서버) /
  PostgreSQL(Supabase), `shared/`로 프론트·백 타입 공유
- **크롤러**: HTML 스크래핑이 아닌 기업마당 공식 REST API 직접 연동, GitHub Actions
  cron으로 매일 자동 수집
- **AI 첨부파일 추출**: 정규식 우선 + AI 보완 방식 — 실측 결과 정규식 성공률(76.9%)이
  AI 단독(46.7%)보다 높아, 정규식이 fallback일 때만 AI 값으로 보완하도록 채택 기준을 명확히 분리
- **매칭 스코어링**: 업종/지역/직원수/연매출/업력 조건별 가점 + region/supportRealm
  hard filter, 정렬 동점 시 id 2차 정렬로 페이지네이션 결과 안정성 확보
- **성능/정확도**: `findById` 상세 조회에 TTL 캐시 적용, dday 계산을 KST 기준으로
  명시화해 자정 전후 마감일 표시 오차 제거

### 구현에서 개선해야 할 점

- **소상공인 매칭 정확도**: 기업마당 API만으로는 "소상공인" 명시 비율(7.5%)·업종
  카테고리 매칭률(6.2%)이 낮음 — K-Startup·소상공인24 크롤링 소스 추가가 계획되어
  있으나 아직 착수 전 ([이슈 #80](https://github.com/syd348/hub/issues/80))
- **조건 필터**: 업종/지역 필터용 구조화 컬럼이 DB 스키마에 아직 없어 정렬 위주로만
  동작 — 본격적인 매칭 알고리즘은 후속 과제
- **AI 추출 처리량**: Gemini 무료 티어 요청 한도가 모델당 하루 20건으로, 평일 신규
  공고(30~55건)보다 적어 일부만 커버됨 — 한도 초과분은 정규식 fallback으로 유지 중

## 문서 지도

| 파일 | 역할 |
|------|------|
| [`CONTEXT.md`](./CONTEXT.md) | 제품 언어·현재 기술스택/제약을 빠르게 파악 |
| [`AGENTS.md`](./AGENTS.md) | 작업 유형별 확인할 문서, 코딩·커밋·PR 규칙 (`CLAUDE.md`는 이 파일의 심볼릭 링크) |
| [`docs/plan.md`](./docs/plan.md) | 기획서 — 문제 정의, MVP 범위, 화면 흐름 (제품 스펙 단일 소스) |
| [`docs/user-stories.md`](./docs/user-stories.md) | Epic·유저 스토리·인수 조건 |
| [`docs/week2_plan.md`](./docs/week2_plan.md) / [`docs/week3_plan.md`](./docs/week3_plan.md) | 주차별 계획·이슈 진행 현황 (유일한 상태 소스) |
| [`prototype/gov_subsidy_home_wireframe.html`](./prototype/gov_subsidy_home_wireframe.html) | UI/UX 와이어프레임 |
| [`.cursor/skills/gov-subsidy-design/`](./.cursor/skills/gov-subsidy-design/) | 디자인 구현 Skill |
| [`.cursor/skills/issue-workflow/`](./.cursor/skills/issue-workflow/) | 이슈 계획→구현→PR 워크플로우 Skill |

## 로컬 실행

```bash
git clone <repo-url>
cd hub
npm install
cp .env.example .env
npm run dev          # client + server 동시 실행
```

- API 헬스체크: `GET http://localhost:3001/api/health`
- 지원금 목록: `GET http://localhost:3001/api/subsidies`

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 클라이언트 + 서버 동시 실행 |
| `npm run dev:client` / `npm run dev:server` | 각각 단독 실행 |
| `npm run build` | 서버 + 클라이언트 빌드 |
| `npm test` | 전체 워크스페이스 테스트 |
| `npm run lint` | oxlint |
| `npm run run -w @hub/crawler` | 기업마당 크롤러 수동 실행 |
