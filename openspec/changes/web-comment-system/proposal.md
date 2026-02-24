## Why

`comment-system` API가 제공되어도 포스트 상세에서 댓글을 읽고 쓰는 UI가 없으면 소통 루프가 완성되지 않는다. 댓글 작성/삭제와 개수 표시를 프론트엔드에서 일관되게 제공해야 한다.

## What Changes

- **댓글 목록 UI**: `/posts/[id]` 하단에 시간순 댓글 목록 표시
- **댓글 작성 UX**: 입력, 제출 중 상태, 실패 메시지, 재입력 흐름 제공
- **댓글 삭제 UX**: 본인 댓글만 삭제 버튼 노출 및 삭제 반영
- **댓글 개수 동기화**: 상세 화면 댓글 개수와 실제 목록 상태 일치
- **비인증 처리**: 댓글 작성 시 로그인 안내/리다이렉트 처리
- **디자인 이식**: `.legacy/nadoharu-front` 댓글 섹션 레이아웃 참조

**선행 요구사항**:

- `post-system` 완료
- `comment-system` 완료

**범위 제외**:

- 대댓글(nested comments)
- 댓글 수정 기능

## Capabilities

### New Capabilities

- `web-comment-list`: 포스트 단건 화면 댓글 목록 렌더링
- `web-comment-create`: 댓글 작성/실패 처리/재시도 UX
- `web-comment-delete`: 본인 댓글 삭제 인터랙션
- `web-comment-count`: 댓글 개수 표시 및 동기화

### Modified Capabilities

- `web-post-detail-public`: 포스트 상세 화면에 댓글 블록 결합

## Impact

**프론트엔드 (apps/web)**:

- `app/posts/[id]/_components`에 댓글 전용 컴포넌트/훅/GraphQL 문서 추가
- 댓글 작성 상태(loading/error) 처리 로직 추가

**테스트**:

- Vitest: 댓글 작성/삭제 상태 전이, 권한 분기
- Playwright: 포스트 상세 댓글 생성/삭제 E2E
