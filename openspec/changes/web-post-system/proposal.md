## Why

`post-system` 백엔드 API가 준비되어도, 사용자에게 실제 게시물 경험을 제공할 프론트엔드 화면/상호작용이 없으면 핵심 가치(일상 공유)가 전달되지 않는다. 인증 경계(`posts` 보호, `post(id)` 공개)와 커서 기반 UX를 프론트에서 명확히 구현할 필요가 있다.

## What Changes

- **타임라인 화면**: `/posts`에서 커서 기반 무한 스크롤 타임라인 표시
- **접근 제어 UX**: 비인증 사용자의 `/posts` 접근 시 로그인 안내 표시
- **단건 공개 화면**: `/posts/[id]`에서 비인증 사용자도 게시물 상세 조회 가능
- **게시물 작성/수정 UX**: 텍스트/subcontent/이미지 입력 UI 및 제출 상태 처리
- **카테고리 임시 정책**: 카테고리 UI는 이번 범위에서 제외하고, 작성/수정 시 카테고리는 빈 값으로 고정
- **이미지 업로드 UX**: presigned URL 기반 업로드 + 업로드 실패/재시도 처리
- **디자인 이식**: `.legacy/nadoharu-front`를 참조해 톤/인터랙션 정렬

**선행 요구사항**:

- `post-system` 구현 완료

**범위 제외**:

- 추천 탭(비인증 공개 피드) 신규 도입
- 고급 에디터(드래그 정렬, 이미지 필터 등)
- content 패턴(예: `[카테고리]`) 기반 카테고리 지정 규칙 도입

## Capabilities

### New Capabilities

- `web-post-timeline`: 인증 사용자용 `/posts` 타임라인 조회/무한 스크롤
- `web-post-detail-public`: 공개 접근 가능한 `/posts/[id]` 단건 조회 화면
- `web-post-editor`: 게시물 작성/수정 폼과 제출/오류 UX
- `web-post-image-upload-flow`: presigned URL 기반 이미지 업로드 UX

### Modified Capabilities

- `web-auth-route-guard`: `/posts` 보호 라우트, `/posts/[id]` 공개 라우트 정책 확장

## Impact

**프론트엔드 (apps/web)**:

- `app/posts`, `app/posts/[id]` 라우트 및 `_components` 추가
- near-operation-file GraphQL 문서/생성 타입 추가
- 로그인 안내, 로딩/에러/빈 상태 UI 추가

**테스트**:

- Vitest: 폼/상태 전이/권한 분기 테스트
- Playwright: 비인증 접근 가드, 타임라인 스크롤, 단건 공개 조회 시나리오
