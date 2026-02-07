## Why

나도하루의 핵심 기능인 게시물(Post) 시스템을 구축한다. 사용자가 텍스트와 이미지로 일상을 공유하고, 타임라인에서 다른 사용자의 게시물을 볼 수 있도록 한다.

## What Changes

- **게시물 CRUD**: 작성, 수정, 삭제, 조회
- **타임라인 피드**: 커서 기반 무한 스크롤 (Relay Cursor Connections)
- **이미지 업로드**: S3 호환 스토리지 (Cloudflare R2) + 클라이언트 압축
- **태그 시스템**: 게시물에 태그 추가 (배열 필드)
- **카테고리**: 게시물 분류 (선택적)
- **제약 조건**: 텍스트 최대 150자, 이미지 최대 4장 (개별 1MB 이하, 클라이언트 압축 권장)

**레거시 GraphQL 호환**:
- Query: `posts` (타임라인), `post(id)` (단일 조회)
- Mutation: `createPost`, `updatePost`, `deletePost`

## Capabilities

### New Capabilities

- `post-crud`: 게시물 생성, 수정, 삭제, 조회 API
- `post-timeline`: 커서 기반 무한 스크롤 타임라인
- `image-upload`: S3 호환 스토리지 업로드 (signed URL 발급)
- `post-validation`: 텍스트/이미지 제약 조건 검증

### Modified Capabilities

<!-- 기존 스펙 변경 없음 -->

## Impact

**백엔드 (apps/api)**:
- 새 bounded-context: `post`
- Prisma 모델: `Post` (content, tags, category, imageUrls, authorId)
- GraphQL Schema: Query `posts`, `post`, Mutation `createPost`, `updatePost`, `deletePost`
- S3 클라이언트: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- 환경 변수: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`

**프론트엔드 (apps/web)**:
- 레거시 프론트엔드와 호환 (현재는 영향 없음)

**인프라**:
- Cloudflare R2 버킷 설정 (로컬은 MinIO)
- CORS 설정 (presigned URL 업로드)

**데이터베이스**:
- PostgreSQL `Post` 테이블 생성
- 인덱스: `authorId`, `createdAt` (타임라인 성능)

**테스트**:
- Unit: 게시물 도메인 로직 (150자 검증, 이미지 4장 제한)
- Integration: CRUD API, 타임라인 페이지네이션, S3 presigned URL 발급
