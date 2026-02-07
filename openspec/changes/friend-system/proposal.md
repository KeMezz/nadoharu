## Why

사용자 간 친구 관계를 관리하는 시스템을 구현한다. 친구 신청 → 수락/거절 방식의 양방향 관계로, 친구끼리만 게시물을 볼 수 있도록 하는 기반을 마련한다.

## What Changes

- **친구 신청**: 다른 사용자에게 친구 요청 전송
- **친구 요청 수락/거절**: 받은 요청을 수락하거나 거절
- **친구 목록 조회**: 현재 친구 관계인 사용자 목록
- **받은 요청 목록**: 아직 처리하지 않은 친구 요청 목록
- **친구 관계 상태**: PENDING, ACCEPTED, REJECTED

**레거시 GraphQL 호환**:
- Mutation: `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`
- Query: `friends`, `receivedFriendRequests`

**선행 요구사항**:
- `authentication-system` 완료 (User 모델 필요)

## Capabilities

### New Capabilities

- `friend-request`: 친구 신청 전송 API
- `friend-response`: 친구 요청 수락/거절 API
- `friend-list`: 친구 목록 조회
- `friend-request-list`: 받은 친구 요청 목록 조회

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:
- 새 bounded-context: `friend` (또는 `social`)
- Prisma 모델: `Friendship` (requesterId, addresseeId, status: PENDING/ACCEPTED/REJECTED)
- GraphQL Mutation: `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`
- GraphQL Query: `friends`, `receivedFriendRequests`

**프론트엔드 (apps/web)**:
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**데이터베이스**:
- PostgreSQL `Friendship` 테이블 생성
- 유니크 제약: `(requesterId, addresseeId)` + 애플리케이션 레벨 양방향 중복 체크 (중복 요청 방지)
- 인덱스: `requesterId`, `addresseeId`, `status`

**테스트**:
- Unit: 친구 관계 상태 전이 로직 (PENDING → ACCEPTED/REJECTED)
- Integration: 친구 신청/수락/거절 API, 권한 검증 (자신에게 온 요청만 수락 가능)
