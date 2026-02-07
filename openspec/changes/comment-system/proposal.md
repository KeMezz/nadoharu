## Why

사용자가 게시물에 댓글을 달아 소통할 수 있도록 댓글 시스템을 구현한다. 간단한 CRUD 기능으로 시작하며, 대댓글은 추후 확장 시 고려한다.

## What Changes

- **댓글 작성**: 게시물에 댓글 추가
- **댓글 삭제**: 자신이 작성한 댓글 삭제 (수정 기능은 제외)
- **댓글 목록 조회**: 특정 게시물의 댓글 목록 (시간순 정렬)
- **댓글 개수**: 게시물별 댓글 개수 집계

**레거시 GraphQL 호환**:
- Mutation: `createComment`, `deleteComment`
- Query: `comments(postId)` (댓글 목록)

**선행 요구사항**:
- `post-system` 완료 (Post 모델 필요)

**범위 제외**:
- 대댓글 (nested comments) → 추후 확장
- 댓글 수정 → 추후 추가

## Capabilities

### New Capabilities

- `comment-crud`: 댓글 생성, 삭제, 조회 API
- `comment-list`: 특정 게시물의 댓글 목록 조회
- `comment-count`: 게시물별 댓글 개수 집계

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:
- 새 bounded-context: `comment` (또는 post 컨텍스트에 포함)
- Prisma 모델: `Comment` (content, postId, commenterId, createdAt)
- GraphQL Mutation: `createComment`, `deleteComment`
- GraphQL Query: `comments`, Post 타입에 `comments`, `commentCount` 필드 추가

**프론트엔드 (apps/web)**:
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**데이터베이스**:
- PostgreSQL `Comment` 테이블 생성
- 인덱스: `postId`, `createdAt` (댓글 목록 조회 성능)

**테스트**:
- Unit: 댓글 도메인 로직
- Integration: 댓글 CRUD API, 권한 검증 (자신의 댓글만 삭제)
