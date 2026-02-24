## Why

채팅은 도메인 로직만으로 완성되지 않고, 방 목록-메시지 입력-실시간 수신의 연속 UX가 필요하다. `chat-system` 백엔드 API를 기반으로 사용 가능한 모바일 우선 채팅 UI를 준비해야 한다.

## What Changes

- **채팅방 목록**: `/chats`에서 참여 채팅방 목록과 최근 메시지 표시
- **채팅방 진입**: 사용자 프로필/카드에서 1:1 채팅방 생성 또는 기존 방 진입
- **메시지 히스토리**: `/chats/[chatRoomId]`에서 과거 메시지 조회/스크롤
- **실시간 메시지 수신**: Subscription으로 신규 메시지 즉시 반영
- **메시지 전송 UX**: 입력, 전송 중 상태, 실패 재시도 처리
- **디자인 이식**: `.legacy/nadoharu-front` 채팅 인터랙션 톤 참조

**선행 요구사항**:

- `chat-system` 완료

**범위 제외**:

- 읽음 표시(read receipt)
- 파일/이미지 첨부 채팅

## Capabilities

### New Capabilities

- `web-chat-room-list`: 채팅방 목록 조회/렌더링
- `web-chat-room-entry`: 1:1 채팅방 생성/진입 UX
- `web-chat-message-history`: 채팅 히스토리 조회 화면
- `web-chat-message-send`: 메시지 전송 인터랙션
- `web-chat-realtime-message`: 실시간 신규 메시지 반영

### Modified Capabilities

- `web-auth-route-guard`: 채팅 라우트 보호 정책 확장

## Impact

**프론트엔드 (apps/web)**:

- `app/chats`, `app/chats/[chatRoomId]` 라우트 및 컴포넌트 추가
- 채팅 Query/Mutation/Subscription 문서 및 생성 타입 추가

**테스트**:

- Vitest: 메시지 전송 상태/에러 처리 테스트
- Playwright: 채팅방 진입, 메시지 송수신 시나리오 E2E
