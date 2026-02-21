---
description: Claude PR 리뷰 코멘트를 검토하고 타당성 판단 후 수정/반론/결과 댓글까지 처리합니다.
---

Claude PR 코멘트를 수집해 타당성을 판단하고, 필요한 코드/문서 수정과 GitHub 대응 댓글(@claude 멘션 포함)까지 완료한다.

**Input**: `/resolve-claude-review` 뒤 인자(선택: PR 번호 또는 PR URL)

## Steps

1. **PR 및 코멘트 수집**
   - PR 번호 인자가 있으면 사용, 없으면 현재 브랜치의 열린 PR 자동 감지
   - `gh pr view <PR번호> --json title,state,headRefName,baseRefName,url`
   - `gh api repos/<owner>/<repo>/pulls/<PR번호>/reviews`
   - `gh api repos/<owner>/<repo>/pulls/<PR번호>/comments`
   - `gh api repos/<owner>/<repo>/issues/<PR번호>/comments`
   - `claude[bot]` 작성 코멘트와 미해결 리뷰 스레드를 우선 수집

2. **코멘트 타당성 분석**
   - 코멘트를 `수정 필요`, `부분 수용`, `반론`, `후속 이관`으로 분류
   - 근거는 실제 파일/라인과 프로젝트 규칙(CLAUDE.md, 아키텍처, 테스트)으로 확인

3. **수정 실행 (필요 시)**
   - TDD(RED → GREEN → REFACTOR)로 테스트 선작성 후 코드 수정
   - 변경 범위는 코멘트 관련 부분으로 제한
   - 테스트/린트 실행으로 회귀 확인

4. **커밋/푸시**
   - Conventional Commit(한국어 description)으로 커밋
   - PR head 브랜치에 push

5. **GitHub 대응 댓글 작성**
   - 코멘트별 대응 결과(수정/반론/후속 이관) 요약
   - 수정사항은 커밋 SHA와 파일 경로를 포함
   - 최종 댓글에서 `@claude`를 멘션하고 검토 결과를 공유

6. **결과 보고**
   - 사용자에게 처리 건수, 수정 파일, 커밋 SHA, 댓글 URL을 보고

## Guardrails

- PR이 CLOSED/MERGED면 중단 후 안내
- force push 및 amend 금지
- 리뷰 스레드는 자동 resolve 처리하지 않음
- 리뷰 범위를 벗어난 과도한 리팩터링 금지
