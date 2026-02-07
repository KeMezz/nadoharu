## Why

사용자 간 1:1 실시간 메시징 기능을 구현한다. GraphQL Subscriptions (WebSocket)을 활용하여 실시간 채팅 경험을 제공한다.

## What Changes

- **채팅방 생성**: 두 사용자 간 채팅방 자동 생성 (또는 기존 방 조회)
- **메시지 전송**: 채팅방에 메시지 전송
- **메시지 목록 조회**: 특정 채팅방의 메시지 히스토리 (페이지네이션)
- **채팅방 목록**: 자신이 참여한 채팅방 목록 (최근 메시지 시간순)
- **실시간 메시지 수신**: GraphQL Subscription으로 새 메시지 푸시

**레거시 GraphQL 호환**:
- Mutation: `sendMessage`, `createChatRoom`
- Query: `chatRooms`, `messages(chatRoomId)`
- Subscription: `messageReceived(chatRoomId)`

**선행 요구사항**:
- `authentication-system` 완료 (User 모델 필요)

## Capabilities

### New Capabilities

- `chat-room-management`: 채팅방 생성, 조회
- `message-send`: 메시지 전송 API
- `message-history`: 채팅방 메시지 히스토리 조회
- `realtime-message`: GraphQL Subscription으로 실시간 메시지 푸시

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:
- 새 bounded-context: `chat`
- Prisma 모델: `ChatRoom` (participant1Id, participant2Id), `Message` (chatRoomId, senderId, content, createdAt)
- GraphQL Mutation: `sendMessage`, `createChatRoom`
- GraphQL Query: `chatRooms`, `messages`
- GraphQL Subscription: `messageReceived` (WebSocket)
- 의존성: `graphql-subscriptions`, `graphql-ws`

**프론트엔드 (apps/web)**:
- WebSocket 연결 설정 (Apollo Client Subscription)
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**데이터베이스**:
- PostgreSQL `ChatRoom`, `Message` 테이블 생성
- 인덱스: `chatRoomId`, `createdAt` (메시지 조회 성능)
- 유니크 제약: ChatRoom에서 두 사용자 조합 (participant1Id < participant2Id 정렬)

**인프라**:
- WebSocket 엔드포인트 설정 (NestJS GraphQL Subscription)

**테스트**:
- Unit: 채팅방 생성 로직 (중복 방지)
- Integration: 메시지 전송 API, Subscription 푸시 확인
