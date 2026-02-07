## Why

사용자 활동(친구 신청, 나도, 댓글 등)에 대한 알림 시스템을 구축한다. 실시간 알림 푸시와 알림 목록 조회를 제공하여 사용자 참여를 유도한다.

## What Changes

- **알림 생성**: 특정 이벤트 발생 시 자동으로 알림 생성
  - 친구 신청 받음
  - 게시물에 나도 받음
  - 게시물에 댓글 받음
- **알림 집계**: 스팸 방지를 위한 집계 규칙
  - 동일 타입 알림은 1시간 내 집계 (예: "3명이 나도했습니다")
  - 또는 실시간 알림 + 일일 요약 알림(daily digest) 분리
- **알림 목록 조회**: 자신의 알림 목록 (시간순, 읽음/안읽음 상태)
- **알림 읽음 처리**: 특정 알림을 읽음으로 표시
- **실시간 알림 푸시**: GraphQL Subscription으로 새 알림 실시간 전달

**레거시 GraphQL 호환**:
- Query: `notifications` (알림 목록)
- Mutation: `markNotificationAsRead`
- Subscription: `notificationReceived`

**선행 요구사항**:
- `friend-system`, `nado-feature`, `comment-system` 완료 (알림 트리거 이벤트)

## Capabilities

### New Capabilities

- `notification-generation`: 이벤트 기반 알림 자동 생성
- `notification-list`: 알림 목록 조회 (읽음/안읽음 필터)
- `notification-read`: 알림 읽음 처리
- `realtime-notification`: GraphQL Subscription으로 실시간 알림 푸시

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:
- 새 bounded-context: `notification`
- Prisma 모델: `Notification` (userId, type: FRIEND_REQUEST/NADO/COMMENT, relatedId, isRead, createdAt)
- GraphQL Query: `notifications`
- GraphQL Mutation: `markNotificationAsRead`
- GraphQL Subscription: `notificationReceived`
- 이벤트 핸들러: 친구 신청, 나도, 댓글 생성 시 알림 생성 로직

**프론트엔드 (apps/web)**:
- WebSocket 연결 설정 (Apollo Client Subscription)
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**데이터베이스**:
- PostgreSQL `Notification` 테이블 생성
- 인덱스: `userId`, `isRead`, `createdAt`

**테스트**:
- Unit: 알림 생성 로직
- Integration: 친구 신청 시 알림 생성 확인, Subscription 푸시 확인
