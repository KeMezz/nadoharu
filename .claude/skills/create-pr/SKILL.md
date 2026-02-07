---
name: create-pr
description: GitHub PR 템플릿 기반으로 Pull Request를 생성합니다. 현재 브랜치의 변경 사항을 분석하고 PR 템플릿에 맞춰 PR을 작성합니다.
metadata:
  author: nadoharu
  version: "1.0"
---

# Create PR

프로젝트의 PR 템플릿(`.github/pull_request_template.md`)을 기반으로 GitHub Pull Request를 생성한다.

**Input**: 브랜치 이름 또는 PR 대상 설명 (선택). 없으면 현재 브랜치에서 자동 감지.

**Steps**

1. **현재 상태 파악**

   아래 명령을 병렬로 실행하여 현재 브랜치 상태를 파악한다:
   - `git status` — 커밋되지 않은 변경 확인
   - `git branch --show-current` — 현재 브랜치 이름
   - `git log main..HEAD --oneline` — base 브랜치 대비 커밋 목록
   - `git diff main...HEAD --stat` — 변경된 파일 요약

   커밋되지 않은 변경이 있으면 먼저 커밋할지 사용자에게 확인한다.

2. **PR 템플릿 읽기**

   `.github/pull_request_template.md` 파일을 읽어 PR 본문 구조를 파악한다.

3. **변경 사항 분석**

   커밋 히스토리와 diff를 분석하여:
   - **변경 사항**: 이 PR에서 무엇이 바뀌었는지 요약
   - **변경 유형**: feat / fix / refactor / test / docs / chore 중 해당 항목 체크
   - **관련 Change**: `openspec/changes/` 디렉토리에 관련 change가 있으면 자동 연결
   - **테스트**: 테스트 코드가 추가/수정되었는지 확인
   - **체크리스트**: 각 항목을 실제로 검증

4. **PR 생성**

   `gh pr create` 명령으로 PR을 생성한다:
   ```bash
   gh pr create --title "<타입>: <간결한 제목>" --body "$(cat <<'EOF'
   <PR 템플릿 기반 본문>
   EOF
   )"
   ```

   - 타이틀은 70자 이내, conventional commit 형식
   - 본문은 PR 템플릿의 모든 섹션을 채워서 작성
   - remote에 push되지 않았으면 `git push -u origin <branch>` 먼저 실행

5. **결과 출력**

   생성된 PR URL을 사용자에게 반환한다.

**Guardrails**
- PR 템플릿이 없으면 기본 형식(Summary + Test plan)으로 폴백
- main/master 브랜치에서 직접 PR 생성하지 않음 — 경고 후 중단
- 커밋이 없으면 PR을 생성하지 않음
- `--force` push는 절대 하지 않음
