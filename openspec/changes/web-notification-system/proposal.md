## Why

사용자 참여 루프를 강화하려면 알림은 단순 API가 아니라 즉시 인지되는 프론트 경험이어야 한다. `notification-system` API를 목록/읽음/실시간 UI로 연결해 행동 전환을 만들 필요가 있다.

## What Changes

- **알림 센터 화면**: `/notifications`에서 시간순 알림 목록 표시
- **읽음 처리 UX**: 개별 알림 읽음 처리 및 시각적 상태 반영
- **실시간 인입 표시**: Subscription 기반 신규 알림 배지/리스트 업데이트
- **딥링크 이동**: 알림 클릭 시 관련 화면(친구 요청/포스트 상세 등) 이동
- **로그인 가드**: 알림 화면은 인증 사용자만 접근 허용
- **디자인 이식**: `.legacy/nadoharu-front` 알림 리스트 패턴 참조

**선행 요구사항**:

- `notification-system` 완료

**범위 제외**:

- 푸시 알림(OS 레벨)
- 일일 요약(digest) 설정 UI

## Capabilities

### New Capabilities

- `web-notification-list`: 알림 목록 렌더링
- `web-notification-read-state`: 읽음/안읽음 상태 전환 UX
- `web-notification-realtime`: 실시간 알림 인입 반영
- `web-notification-deeplink`: 알림 타입별 상세 화면 이동

### Modified Capabilities

- `web-auth-route-guard`: `/notifications` 보호 라우트 정책 확장

## Impact

**프론트엔드 (apps/web)**:

- `app/notifications` 라우트 및 알림 전용 컴포넌트/훅 추가
- Subscription 클라이언트 활용 지점 추가

**테스트**:

- Vitest: 읽음 상태 전환/딥링크 라우팅 테스트
- Playwright: 신규 알림 반영 및 상세 이동 E2E
