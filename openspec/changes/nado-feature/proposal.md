## Why

나도하루의 핵심 인터랙션 "나도!"를 구현한다. 다른 사람의 게시물에 공감을 표현하고, 나도한 게시물이 자신의 타임라인에 리포스트로 노출되도록 한다.

## What Changes

- **나도 추가/취소**: 게시물에 나도 토글 기능
- **NadoPost (리포스트)**: 나도한 게시물이 타임라인에 표시 (리포스트 성격)
- **나도 사용자 목록**: 특정 게시물에 나도한 사용자 목록 조회
- **나도 카운트**: 게시물별 나도 개수 집계

**레거시 GraphQL 호환**:
- Mutation: `addNado`, `removeNado`
- Query: `nadoUsers(postId)` (나도한 사용자 목록)

**선행 요구사항**:
- `post-system` 완료 (Post 모델 필요)

## Capabilities

### New Capabilities

- `nado-toggle`: 나도 추가/취소 API
- `nado-repost`: 나도한 게시물을 타임라인에 리포스트로 표시
- `nado-users-list`: 특정 게시물에 나도한 사용자 목록 조회
- `nado-count`: 게시물별 나도 개수 집계

### Modified Capabilities

- `post-timeline`: 나도한 게시물(리포스트)도 타임라인에 포함

## Impact

**백엔드 (apps/api)**:
- Prisma 모델: `Nado` (postId, userId, createdAt) — 다대다 관계 테이블
- Post 모델 확장: `nados` 관계, `nadoCount` 계산 필드 (가상 또는 집계)
- GraphQL Mutation: `addNado`, `removeNado`
- GraphQL Query: `nadoUsers`, Post 타입에 `nados`, `nadoCount` 필드 추가

**프론트엔드 (apps/web)**:
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**데이터베이스**:
- PostgreSQL `Nado` 테이블 생성
- 유니크 제약: `(postId, userId)` (중복 나도 방지)
- 인덱스: `postId`, `userId`

**테스트**:
- Unit: 나도 중복 방지 로직
- Integration: 나도 추가/취소 API, 타임라인에 리포스트 표시 확인
