---
description: 변경사항을 분석해 브랜치를 만들고 Conventional Commit으로 커밋합니다.
---

로컬 변경사항을 분석하여 브랜치를 만들고 Conventional Commit으로 커밋한다.

**Input**: `/branch-and-commit` 뒤 인자(브랜치명 또는 작업 설명, 선택)

## Steps

1. **현재 상태 파악**
   - `git status`
   - `git diff`
   - `git diff --cached`
   - `git branch --show-current`
   - `git log --oneline -5`
   - 변경사항이 없으면 중단한다.

2. **브랜치 생성**
   - 현재 브랜치가 `main`/`master`이면 새 브랜치를 생성한다.
   - 입력 인자가 브랜치명이면 그대로 사용한다.
   - 입력이 없으면 변경사항을 기반으로 `<type>/<short-description>` 형식으로 자동 생성한다.
   - 예: `feat/add-auth`, `fix/login-redirect`, `chore/opencode-setup`

3. **커밋 메시지 작성**
   - Conventional Commit 형식 사용:
   - `<type>(<scope>): <description>`
   - description은 한국어, 50자 이내

4. **스테이징 및 커밋**
   - 변경 파일을 개별적으로 `git add <file>` 한다.
   - 민감 파일(`.env`, `credentials`, 비밀키)은 제외한다.
   - HEREDOC으로 커밋 메시지를 전달해 커밋한다.
   - 커밋 후 `git status`로 성공 여부를 확인한다.

5. **결과 출력**
   - 생성된 브랜치명
   - 커밋 해시
   - 커밋 메시지

## Guardrails

- `git add -A`, `git add .` 사용 금지
- `--force`, `--no-verify` 사용 금지
- amend 금지 (항상 새 커밋)
- 변경사항이 여러 논리 단위이면 커밋을 분리한다
