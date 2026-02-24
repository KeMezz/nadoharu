## Context

현재 `apps/api`는 인증(`auth`) bounded-context 중심으로 동작하며, 게시물 도메인은 아직 구현되지 않았다. 이번 변경은 나도하루의 핵심 사용자 가치(일상 공유)를 담당하는 첫 소셜 도메인으로서, 이후 `comment-system`, `nado-feature`, `notification-system`의 기반 데이터와 조회 흐름을 제공해야 한다.

기술 제약은 다음과 같다.

- 백엔드는 NestJS + GraphQL Code-first + Prisma + PostgreSQL을 사용한다.
- 아키텍처는 DDD/Clean Architecture(의존 방향: Domain <- Application <- Infrastructure)를 준수해야 한다.
- 이미지 업로드는 API 서버 경유가 아니라 S3 호환 스토리지(R2/MinIO) presigned URL 방식이 요구된다.
- 피드는 무한 스크롤을 전제로 하며, offset이 아닌 커서 기반 페이지네이션이 필요하다.

## Goals / Non-Goals

**Goals:**

- `post` bounded-context를 도입해 게시물 CRUD, 단건 조회, 타임라인 조회를 제공한다.
- 텍스트(최대 150자) 및 이미지(최대 4장) 제약을 도메인 규칙으로 일관되게 검증한다.
- 이미지 업로드를 위한 presigned URL 발급 흐름을 정의한다.
- GraphQL 계약(`posts`, `post`, `createPost`, `updatePost`, `deletePost`)을 안정적으로 제공한다.
- 후속 변경(comment/nado/notification)이 결합 가능한 데이터 구조와 조회 기준을 마련한다.

**Non-Goals:**

- 친구 관계 기반 공개 범위 제어(친구 공개/비공개)는 이번 범위에서 다루지 않는다.
- 이미지 리사이징/썸네일 생성/콘텐츠 모더레이션 파이프라인은 포함하지 않는다.
- 해시태그 검색 인덱스, 추천 피드, 랭킹 알고리즘은 포함하지 않는다.
- 소셜 알림 트리거 연동은 별도 change에서 다룬다.

## Decisions

### 1) `post`를 독립 bounded-context로 구성

- **결정**: `apps/api/src/bounded-contexts/post`에 domain/application/infrastructure 레이어를 분리해 구현한다.
- **대안 A**: 기존 `auth` 컨텍스트 내부에 게시물 로직을 임시 포함.
- **대안 B**: 공용 `shared-kernel`에 게시물 로직을 배치.
- **채택 이유**: 게시물은 인증과 생명주기가 다르고, 이후 comment/nado가 의존할 핵심 컨텍스트이므로 경계가 분리되어야 변경 비용이 낮다.

### 2) 데이터 모델은 단일 `Post` 엔티티 + 배열 필드로 시작

- **결정**: `Post`에 `content`, `tags(String[])`, `category(String?)`, `imageUrls(String[])`, `authorId`, `createdAt`, `updatedAt`를 둔다.
- **대안 A**: 이미지를 별도 `PostImage` 테이블로 정규화.
- **대안 B**: 태그/카테고리를 별도 관계 테이블로 분리.
- **채택 이유**: 현재 제약(이미지 최대 4장, 단순 태그/카테고리)에서는 단일 레코드 모델이 구현 복잡도를 크게 줄인다. 검색/통계 요구가 명확해질 때 정규화로 확장한다.

### 3) 업로드는 "presigned URL 발급"과 "게시물 저장"을 분리

- **결정**: 업로드 URL 발급 전용 GraphQL 작업(예: 업로드 키/URL 발급)을 두고, `createPost`/`updatePost`는 업로드 완료된 `imageUrls`만 저장한다.
- **대안 A**: GraphQL mutation에서 바이너리/멀티파트를 직접 수신.
- **대안 B**: Base64 이미지 문자열을 mutation payload로 전달.
- **채택 이유**: API 서버 대역폭과 메모리 부담을 줄이고, 스토리지 계층 책임을 분리할 수 있다. 클라이언트 재시도 및 병렬 업로드도 단순해진다.

### 4) 타임라인은 Relay Connection + 복합 커서(`createdAt`, `id`)를 사용

- **결정**: `posts`는 `createdAt DESC, id DESC` 정렬을 기본으로 하고, 커서는 `createdAt`과 `id`를 함께 인코딩한다.
- **대안 A**: `createdAt` 단일 커서 사용.
- **대안 B**: offset/limit 페이지네이션 사용.
- **채택 이유**: 동일 시각 생성 데이터에서 순서 안정성을 보장하고, 대량 데이터에서도 offset 스캔 비용을 피할 수 있다.

### 5) 검증 책임을 Domain/Application/Infrastructure로 분리

- **결정**:
  - Domain: 콘텐츠 길이, 이미지 개수 등 비즈니스 불변식 검증
  - Application: 작성자 권한, 존재성, 상태 전이 검증
  - Infrastructure: URL 형식/버킷 경로/업로드 메타데이터 검증
- **대안 A**: Resolver에서 모든 검증 수행.
- **대안 B**: DB 제약에 대부분 위임.
- **채택 이유**: 테스트 가능한 규칙 경계를 만들고, API 입력 방식이 변경돼도 도메인 규칙을 재사용할 수 있다.

### 6) 삭제는 초기부터 소프트 삭제를 기본으로 채택

- **결정**: `deletePost`는 물리 삭제 대신 `deletedAt`을 설정하는 소프트 삭제로 처리하고, 기본 조회(`posts`, `post`)에서는 `deletedAt IS NULL` 조건으로 제외한다.
- **대안 A**: 하드 삭제(물리 삭제).
- **대안 B**: 소프트 삭제 + 즉시 비동기 아카이브.
- **채택 이유**: 후속 도메인(comment/nado/notification) 연계 시 참조 정합성과 운영 복구 가능성을 확보하기 위해 초기부터 소프트 삭제가 안전하다.

### 7) 타임라인(`posts`)은 초기부터 인증 사용자 컨텍스트를 요구

- **결정**: `posts` 타임라인 조회는 인증 사용자만 가능하도록 제한한다. 비인증 사용자가 조회하면 인증 오류를 반환하고, 클라이언트는 로그인 안내를 표시한다.
- **보완 규칙**: 단건 조회 `post(id)`는 공개 접근을 허용해 비인증 사용자도 게시물 상세를 조회할 수 있게 한다.
- **대안 A**: 타임라인을 전체 공개로 운영.
- **대안 B**: 별도 추천 탭을 신설해 비인증에도 타임라인 유사 목록 제공.
- **채택 이유**: 타임라인은 친구 관계/나도 리포스트 등 사용자 컨텍스트 의존 기능으로 확장될 예정이므로 초기부터 인증 경계를 고정하는 편이 일관성과 확장성에 유리하다.

### 8) 업로드 포맷은 넓게 허용하되 서버 용량 제한을 둔다

- **결정**: 허용 포맷은 `jpeg`, `jpg`, `png`, `webp`, `heic`, `heif`, `gif`로 폭넓게 지원하고, 서버 검증 상한은 이미지당 5MB, 게시물당 최대 4장(총 20MB)으로 제한한다. 클라이언트 1MB 이하 압축은 권장 규칙으로 유지한다.
- **대안 A**: `jpeg/png/webp`만 허용하고 1MB 강제.
- **대안 B**: 포맷/용량 제한을 최소화(사실상 무제한).
- **채택 이유**: 다양한 모바일 기기 포맷을 수용하면서도 업로드 악용, 저장소 비용 급증, 응답 지연 위험을 관리할 수 있다.

## Risks / Trade-offs

- **[소프트 삭제 누락으로 인한 데이터 노출]** -> Repository 기본 조회 조건에 `deletedAt IS NULL`을 강제하고, 통합 테스트에 삭제 데이터 비노출 케이스를 포함한다.
- **[소프트 삭제 데이터 누적으로 인한 성능 저하]** -> `deletedAt` 인덱스를 추가하고, 보존 기간 경과 데이터 배치 정리 정책을 운영 가이드로 분리한다.
- **[배열 컬럼 모델의 확장 한계]** -> 태그 검색/이미지 메타데이터 요구가 생기면 `PostTag`, `PostImage` 분리 마이그레이션 계획을 준비한다.
- **[커서 구현 오류 시 중복/누락]** -> `createdAt+id` 복합 조건을 테스트 케이스로 고정하고, 통합 테스트에 경계 시나리오(동일 timestamp)를 포함한다.
- **[Presigned URL 오용]** -> URL 만료시간을 짧게 설정하고, 사용자별 키 prefix를 강제하며, 저장 시 허용 버킷/경로를 재검증한다.

## Migration Plan

1. Prisma에 `Post` 모델과 인덱스(`authorId`, `createdAt`, `deletedAt`, `(createdAt,id)`)를 추가하고 마이그레이션을 생성한다.
2. `post` bounded-context의 Domain(Entity/VO) -> Application(UseCase/Repository Port) -> Infrastructure(Prisma Repository/Resolver/Module) 순으로 구현한다.
3. GraphQL 스키마에 `posts`, `post`, `createPost`, `updatePost`, `deletePost` 및 업로드 URL 발급 작업을 추가한다.
4. TDD 순서로 단위 테스트(도메인 규칙)와 통합 테스트(CRUD/커서 페이지네이션/권한/업로드 URL)를 작성한다.
5. 스테이징에서 대량 피드 페이지네이션 및 업로드 경로를 검증 후 배포한다.
6. **롤백 전략**: 장애 시 `post` resolver 노출을 비활성화하고, 소프트 삭제만 증가한 경우 서비스 차단 없이 복구 스크립트로 정리한다. 스키마 이슈가 있으면 기능 플래그로 쓰기 경로를 차단한다.
7. **친구 기능 전환(개발 단계 가정)**: 친구 공개 정책 적용 시 조회 필터 규칙을 교체하고, 필요 시 `posts` 관련 데이터를 일괄 정리한 뒤 새 정책으로 재시작한다.

## Open Questions

- 현재 결정된 범위 내 오픈 이슈 없음.
