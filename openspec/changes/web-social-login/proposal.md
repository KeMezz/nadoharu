## Why

현재 로그인 화면의 소셜 버튼은 비활성 상태이며, 실제 OAuth 진입/콜백 UX가 없다. `social-login` 백엔드 API를 연결해 Apple/Kakao/GitHub 로그인 흐름을 프론트에서 완성해야 가입 장벽을 낮출 수 있다.

## What Changes

- **소셜 로그인 활성화**: 로그인 화면 Apple/Kakao/GitHub 버튼을 실제 인증 진입점으로 연결
- **콜백 처리 라우트**: provider별 OAuth 콜백 수신/처리 화면 제공
- **세션 초기화 UX**: 소셜 로그인 성공 후 쿠키 세션 기준 사용자 상태 동기화
- **실패 처리 UX**: 사용자 취소/권한 거부/연동 오류 메시지 규칙 정립
- **기존 로그인 공존**: accountId/password 로그인과 소셜 로그인을 같은 화면에서 병행 제공
- **디자인 이식**: `.legacy/nadoharu-front` 로그인 화면 톤을 유지하면서 동작 활성화

**선행 요구사항**:

- `social-login` 완료
- `web-auth-forms` 기반 화면 존재

**범위 제외**:

- 소셜 계정 연결 해제 UI
- 다중 소셜 계정 병합 워크플로우

## Capabilities

### New Capabilities

- `web-oauth-provider-entry`: provider별 OAuth 인증 진입 UX
- `web-oauth-callback`: OAuth 콜백 처리/로딩/성공 라우팅
- `web-oauth-session-bootstrap`: 로그인 후 `me` 기반 세션 상태 동기화
- `web-oauth-error-feedback`: OAuth 실패 사유별 사용자 메시지 표시

### Modified Capabilities

- `web-auth-forms`: 소셜 버튼을 비활성 표시에서 실제 동작 버튼으로 전환

## Impact

**프론트엔드 (apps/web)**:

- 로그인 라우트와 콜백 라우트(`app/auth/callback/*`) 추가
- OAuth 관련 mutation/query 모듈과 에러 매핑 유틸 추가

**테스트**:

- Vitest: provider 분기, 실패 메시지 매핑 테스트
- Playwright: 소셜 로그인 성공/실패 플로우(모킹) E2E
