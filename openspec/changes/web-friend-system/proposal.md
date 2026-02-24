## Why

친구 도메인의 핵심 가치는 요청-수락 흐름을 사용자가 직관적으로 수행할 때 완성된다. `friend-system` API에 대응하는 친구 신청/응답/목록 UI를 프론트에서 제공해야 이후 공개 범위 제어 기능과 자연스럽게 연결할 수 있다.

## What Changes

- **친구 신청 UI**: 사용자 프로필/카드에서 친구 요청 전송 액션 제공
- **요청함 UI**: 받은 친구 요청 목록과 상태(PENDING) 표시
- **수락/거절 UX**: 요청별 수락/거절 액션 및 낙관적/재동기화 처리
- **친구 목록 화면**: ACCEPTED 관계 사용자 목록 조회 및 표시
- **상태 배지**: 요청 전송됨/친구 상태를 UI 배지로 노출
- **디자인 이식**: `.legacy/nadoharu-front` 관계형 UI 패턴 참조

**선행 요구사항**:

- `friend-system` 완료

**범위 제외**:

- 친구 추천 알고리즘
- 차단/숨김 기능

## Capabilities

### New Capabilities

- `web-friend-request-send`: 친구 신청 전송 인터랙션
- `web-friend-request-inbox`: 받은 친구 요청 목록 조회 UI
- `web-friend-request-response`: 친구 요청 수락/거절 UX
- `web-friend-list-view`: 친구 목록 화면 렌더링
- `web-friend-status-badge`: 친구 관계 상태 배지 노출

### Modified Capabilities

- `web-auth-route-guard`: 친구 관련 화면 보호 라우트 정책 확장

## Impact

**프론트엔드 (apps/web)**:

- `app/friends` 및 관련 라우트 `_components` 추가
- 친구 요청/응답 뮤테이션과 목록 쿼리 문서/생성 타입 추가

**테스트**:

- Vitest: 상태 배지/액션 버튼 분기 테스트
- Playwright: 요청 전송 -> 수락/거절 -> 목록 반영 E2E
