---
name: branch-and-commit
description: 새 브랜치를 생성하고 로컬 변경사항을 Conventional Commit 방식으로 커밋합니다. 변경 사항을 분석하여 적절한 커밋 메시지를 자동 작성합니다.
metadata:
  author: nadoharu
  version: "1.0"
---

# Branch and Commit

로컬 변경사항을 분석하여 새 브랜치를 생성하고 Conventional Commit 방식으로 커밋한다.

**Input**: 브랜치 이름 또는 작업 설명 (선택). 없으면 변경 사항에서 자동 추론.

**Steps**

1. **현재 상태 파악**

   아래 명령을 병렬로 실행:
   - `git status` — 변경된 파일 목록
   - `git diff` — unstaged 변경 내용
   - `git diff --cached` — staged 변경 내용
   - `git branch --show-current` — 현재 브랜치
   - `git log --oneline -5` — 최근 커밋 스타일 확인

   변경사항이 없으면 중단한다.

2. **브랜치 생성**

   현재 브랜치가 main/master이면 새 브랜치를 생성한다:
   - 사용자가 브랜치명을 제공하면 그대로 사용
   - 없으면 변경 내용을 분석하여 `<type>/<short-description>` 형식으로 생성
     - 예: `feat/add-user-auth`, `fix/login-redirect`, `chore/project-init`
   - `git checkout -b <branch-name>`

   이미 feature 브랜치에 있으면 브랜치 생성을 건너뛴다.

3. **변경 사항 분석 및 커밋 단위 결정**

   변경된 파일들을 분석하여:
   - 논리적으로 관련된 파일끼리 그룹화
   - 하나의 커밋으로 묶을지, 여러 커밋으로 나눌지 판단
   - 각 그룹에 대해 Conventional Commit 타입 결정

4. **Conventional Commit 메시지 작성**

   각 커밋에 대해 아래 형식으로 메시지를 작성:

   ```
   <type>(<scope>): <description>

   <body (선택)>
   ```

   **타입**:
   - `feat`: 새 기능
   - `fix`: 버그 수정
   - `refactor`: 리팩토링
   - `test`: 테스트 추가/수정
   - `docs`: 문서 변경
   - `chore`: 빌드, 설정 등 기타
   - `style`: 코드 포매팅
   - `perf`: 성능 개선
   - `ci`: CI/CD 설정

   **scope**: 변경 영역 (예: `api`, `web`, `shared`, `auth`, `post`)

   **description**: 한국어로 작성, 명령형 (~하다), 50자 이내

   **예시**:
   ```
   feat(api): 사용자 인증 모듈 추가
   fix(web): 로그인 리다이렉트 무한 루프 수정
   chore: 프로젝트 초기 설정 및 모노레포 구성
   ```

5. **커밋 실행**

   - 파일을 개별적으로 `git add` (민감 파일 제외: .env, credentials 등)
   - HEREDOC 형식으로 커밋 메시지 전달
   - 커밋 후 `git status`로 결과 확인

6. **결과 출력**

   생성된 브랜치명과 커밋 요약을 출력한다.

**Guardrails**
- `.env`, `.env.*` (`.env.example` 제외), `credentials`, 비밀 키 파일은 커밋하지 않음
- `git add -A`나 `git add .` 대신 개별 파일을 명시적으로 staging
- `--force`, `--no-verify` 옵션은 사용하지 않음
- 기존 커밋을 amend하지 않음 (항상 새 커밋 생성)
- 커밋 전 사용자에게 메시지와 파일 목록을 보여주고 확인받음
