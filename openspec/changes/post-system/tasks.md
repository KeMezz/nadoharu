## 1. 데이터 모델 및 아키텍처 뼈대 준비

- [ ] 1.1 Prisma `Post` 모델에 `deletedAt` 포함 필드와 인덱스(`authorId`, `createdAt`, `deletedAt`, `(createdAt,id)`)를 반영하고 마이그레이션을 생성한다
- [ ] 1.2 `apps/api/src/bounded-contexts/post`에 domain/application/infrastructure 레이어 구조와 `post` 모듈 연결 지점을 생성한다
- [ ] 1.3 Post Repository 포트/Prisma 구현 초안을 만들고 기본 조회 조건(`deletedAt IS NULL`) 적용 기준을 정의한다

## 2. 도메인 규칙 TDD 구현

- [ ] 2.1 RED: 텍스트 150자 제한, 이미지 4장 제한, 공백/빈 콘텐츠 경계, `category` 자유 문자열, `subtitle` 규칙 단위 테스트를 먼저 작성한다
- [ ] 2.2 GREEN: Post Entity/VO에 입력 검증 규칙을 구현해 테스트를 통과시킨다
- [ ] 2.3 REFACTOR: 게시물 검증 에러 코드를 정리하고 GraphQL 에러 매핑 규칙과 연결한다

## 3. 게시물 CRUD 유스케이스 구현

- [ ] 3.1 RED: `createPost`, `updatePost`, `deletePost`, `post(id)` 유스케이스 단위 테스트(작성자 권한, 소프트 삭제, `updatePost.imageUrls` 교체 규칙 포함)를 작성한다
- [ ] 3.2 GREEN: CRUD 유스케이스를 구현하고 작성자 권한/인증 조건을 반영한다
- [ ] 3.3 GREEN: `deletePost`를 `deletedAt` 기반 소프트 삭제로 구현하고 단건 조회에서 삭제 게시물 제외를 보장한다

## 4. 커서 기반 타임라인 구현

- [ ] 4.1 RED: `posts` Connection 응답(`edges`, `pageInfo`), 커서 페이지네이션 중복/누락 방지, `before/last` 미지원 통합 테스트를 작성한다
- [ ] 4.2 GREEN: `createdAt DESC, id DESC` 정렬과 `after` 커서 조건을 사용하는 타임라인 Repository/UseCase를 구현한다
- [ ] 4.3 GREEN: `posts` 조회를 인증 사용자 전용으로 제한하고 비인증 요청에 `UNAUTHORIZED`를 반환하도록 Resolver/Guard를 연결한다

## 5. 이미지 업로드 Presigned URL 구현

- [ ] 5.1 RED: 업로드 URL 발급, 포맷 허용(`jpeg/jpg/png/webp/heic/heif/gif`), `fileSize` 검증, 5MB 제한 테스트를 작성한다
- [ ] 5.2 GREEN: S3 호환 presigned URL 발급 서비스와 GraphQL 작업을 구현한다
- [ ] 5.3 GREEN: URL 발급 시 `users/{userId}/posts/` prefix를 강제하고 `createPost`/`updatePost`에서 동일 사용자 prefix만 수용하도록 검증을 구현한다

## 6. 통합 검증 및 품질 확인

- [ ] 6.1 Post GraphQL 타입/리졸버(`createPost`, `updatePost`, `deletePost`, `post`, `posts`)를 연결하고 API 통합 테스트를 통과시킨다
- [ ] 6.2 API 통합 테스트에서 비인증 `posts` 조회의 `UNAUTHORIZED`와 비인증 `post(id)` 공개 조회 허용을 검증한다
- [ ] 6.3 전체 관련 테스트(api unit/integration)를 실행하고 문서/스키마 산출물을 최신화한다
