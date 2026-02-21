---
description: PR 템플릿에 맞춰 변경사항을 분석하고 GitHub PR을 생성합니다.
---

프로젝트 PR 템플릿(`.github/pull_request_template.md`) 기반으로 GitHub PR을 생성한다.

**Input**: `/create-pr` 뒤 인자(브랜치명 또는 PR 대상 설명, 선택)

## Steps

1. **현재 상태 파악**
   - `git status`
   - `git branch --show-current`
   - `git log main..HEAD --oneline`
   - `git diff main...HEAD --stat`
   - 커밋되지 않은 변경이 있으면 PR 생성을 중단하고 먼저 커밋한다.

2. **PR 템플릿 읽기**
   - `.github/pull_request_template.md`를 읽어 섹션 구조를 파악한다.

3. **변경 사항 분석**
   - 커밋과 diff를 바탕으로 변경사항 요약 작성
   - 유형(feat/fix/refactor/test/docs/chore) 체크
   - 관련 OpenSpec change(`openspec/changes/*`)가 있으면 링크
   - 테스트/체크리스트 항목을 실제 실행 기준으로 작성

4. **원격 반영**
   - 브랜치가 원격에 없으면 `git push -u origin <branch>` 실행

5. **PR 생성**
   - `gh pr create --title "<type>: <title>" --body "$(cat <<'EOF' ... EOF)"`
   - 제목은 70자 이내, Conventional Commit 스타일
   - 템플릿의 모든 섹션을 채워 작성

6. **결과 출력**
   - 생성된 PR URL을 반환한다.

## Guardrails

- `main`/`master`에서 직접 PR 생성 금지
- base 대비 커밋이 없으면 중단
- 템플릿이 없으면 `Summary` + `Test Plan` 기본 형식으로 폴백
- 강제 push(`--force`) 금지
