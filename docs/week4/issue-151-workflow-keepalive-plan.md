# 크롤러 cron 비활동 자동 비활성화 방지 (이슈 #151)

> 작성일: 2026-11-19 (목) · 대상 이슈: [#151 크롤러 cron이 60일 비활동으로 자동 비활성화됨](https://github.com/syd348/hub/issues/151)

## 목표 (한 줄)

**레포에 커밋이 없어도 `Crawler` 워크플로우의 schedule 트리거가 계속 살아있게 한다.**

## 현재 상태 (전환 전)

- `Crawler` 워크플로우 상태가 `disabled_inactivity` — 2026-10-04 실행이 마지막, 이후 약 6주간
  크롤링 중단
- 원인: 공개 레포는 60일간 활동이 없으면 GitHub가 schedule 워크플로우를 자동 비활성화한다.
  마지막 push 2026-08-04(#144) → 60일 경과 후 비활성화
- 크롤러 코드 자체는 정상 — 마지막 실행(10-04)에서 기업마당 200건, K-Startup 11건 upsert 성공
- 2026-11-19 `gh workflow enable` + 수동 실행으로 일단 복구함

## 범위

### 포함 (이번 이슈)
- `.github/workflows/crawler.yml`에 `workflow-keepalive` job 추가
  ([`liskin/gh-workflow-keepalive`](https://github.com/liskin/gh-workflow-keepalive) v1.2.1, SHA 고정)
  - 더미 커밋 없이 `PUT /actions/workflows/{id}/enable` API 호출로 비활성화 타이머를 리셋
  - `schedule` 이벤트에서만 실행, `crawl` job과 독립 — 크롤링이 실패해도 keepalive는 동작
  - job 단위 `permissions: actions: write`만 부여

### 제외 (다음으로)
- 크롤링 실패 알림(Slack/이메일) — #74 계획에서도 제외했던 항목, 필요성 확인되면 별도 이슈
- Node 20 액션 deprecation 경고(`actions/checkout@v4` 등) 대응 — 현재 동작 영향 없음

## 실행 순서

### 묶음 1 — keepalive job 추가
- [x] `crawler.yml`에 `workflow-keepalive` job 추가
- [x] YAML 파싱 확인
- [ ] 머지 후 다음 schedule 실행에서 keepalive job 성공 확인

## 완료 기준

- schedule 실행 시 `workflow-keepalive` job이 성공한다
- 워크플로우 상태가 `active`로 유지된다 (`gh api repos/syd348/hub/actions/workflows/crawler.yml --jq .state`)

## 리스크 / 결정 필요

| 항목 | 판단 |
|---|---|
| 더미 커밋 방식 vs API 재활성화 방식 | API 방식 선택 — 커밋 히스토리 오염 없음, 캠퍼스 레포 동기화에도 영향 없음 |
| 서드파티 액션 공급망 리스크 | 커밋 SHA로 고정(기존 `nick-fields/retry`와 같은 방식). 액션 본체는 `gh api` 한 줄짜리 composite라 검토 완료 |
| 이미 active인 워크플로우를 enable하면 타이머가 리셋되는가 | 액션이 이 동작을 전제로 설계됨. 머지 후 60일 넘게 커밋 없을 때 최종 확인 가능 |
