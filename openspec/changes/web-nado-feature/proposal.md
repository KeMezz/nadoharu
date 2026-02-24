## Why

나도하루의 정체성인 "나도!" 인터랙션은 프론트 경험이 핵심이다. `nado-feature` API를 실제 사용자 행동(토글, 카운트, 나도한 사용자 보기, 리포스트 표시)으로 연결하는 UI 구현이 필요하다.

## What Changes

- **나도 토글 UX**: 포스트 카드/상세에서 나도 추가/취소 버튼 제공
- **카운트 표시**: 나도 개수 표시 및 토글 후 즉시 반영
- **나도 사용자 목록**: 나도한 사용자 목록 모달/시트 UI 제공
- **리포스트 표현**: 타임라인에서 친구의 나도(리포스트) 출처 표시
- **권한 처리**: 비인증 상태에서 나도 시도 시 로그인 안내
- **디자인 이식**: `.legacy/nadoharu-front`의 공감 버튼 인터랙션 참조

**선행 요구사항**:

- `post-system` 완료
- `nado-feature` 완료
- `web-post-system` 완료

**범위 제외**:

- 나도한 사용자 검색/필터
- 나도 취소 히스토리

## Capabilities

### New Capabilities

- `web-nado-toggle`: 나도 추가/취소 버튼 및 상태 반영
- `web-nado-count-display`: 나도 개수 표시/갱신
- `web-nado-users-modal`: 나도 사용자 목록 조회 UI
- `web-nado-repost-render`: 타임라인 리포스트 출처 표현

### Modified Capabilities

- `web-post-timeline`: 나도 리포스트 카드 표현 규칙 결합

## Impact

**프론트엔드 (apps/web)**:

- 포스트 카드/상세 컴포넌트에 나도 관련 UI/훅 추가
- 나도 뮤테이션/목록 쿼리 문서 및 생성 타입 추가

**테스트**:

- Vitest: 토글 상태 전이, 비인증 가드, 개수 반영
- Playwright: 나도 추가/취소 및 리포스트 노출 E2E
