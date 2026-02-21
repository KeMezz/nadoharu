---
name: resolve-claude-review
description: >
  PR의 Claude 코멘트를 확인해 타당성을 검증하고, 필요 시 코드/문서를 수정한 뒤
  @claude 멘션 결과 댓글까지 등록합니다.
  트리거: "claude 리뷰 대응", "claude 코멘트 처리", "resolve claude review"
metadata:
  author: hyeongjin
  version: '1.0'
---

# Resolve Claude Review

PR의 `claude[bot]` 리뷰/코멘트를 대상으로 사실관계를 검증하고, 필요한 수정 또는 반론을 적용한 뒤 최종 결과를 `@claude` 멘션 댓글로 공유한다.

**Input**: PR 번호 또는 GitHub PR URL. 없으면 현재 브랜치의 열린 PR 자동 감지.

## Steps

### 1. PR 상태와 코멘트 수집

```bash
gh pr view <PR번호> --json title,state,headRefName,baseRefName,url
gh api repos/<owner>/<repo>/pulls/<PR번호>/reviews
gh api repos/<owner>/<repo>/pulls/<PR번호>/comments
gh api repos/<owner>/<repo>/issues/<PR번호>/comments
```

- PR 상태가 `OPEN`인지 확인한다.
- `claude[bot]` 코멘트를 우선 추출하고, 미해결 코멘트/스레드를 별도로 정리한다.

### 2. 코멘트 타당성 판정

각 코멘트를 다음으로 분류한다.

- **수정 필요**: 실제 결함/누락/규칙 위반
- **부분 수용**: 지적은 타당하나 해결 방식은 다른 접근이 더 적합
- **반론**: 오해 기반 또는 의도적 설계 결정
- **후속 이관**: 타당하지만 현재 PR 범위를 벗어남

판정 시 반드시 코드/테스트/규칙(CLAUDE.md)을 근거로 남긴다.

### 3. 수정 실행 (필요 시)

1. 실패 테스트 작성 (RED)
2. 최소 구현으로 테스트 통과 (GREEN)
3. 리팩터링 및 회귀 확인 (REFACTOR)

실행 후 `pnpm --filter api test` 또는 관련 테스트 셋, `pnpm --filter api lint`를 수행한다.

### 4. 커밋 및 푸시

- Conventional Commit 형식 사용
- 수정 내역은 새 커밋으로 추가 (amend 금지)
- PR head 브랜치로 push

### 5. GitHub 댓글 대응

코멘트별로 아래 형식으로 대응한다.

```markdown
- [수정 완료] <이슈 요약> — <커밋SHA>
- [부분 수용] <이슈 요약> — <근거>
- [반론] <이슈 요약> — <근거>
- [후속 이관] <이슈 요약> — <후속 액션>
```

### 6. @claude 결과 댓글 작성

최종 댓글은 반드시 `@claude` 멘션을 포함하고 다음 정보를 담는다.

- 검토 대상 코멘트 수
- 처리 결과 집계(수정/부분 수용/반론/후속 이관)
- 반영 커밋 SHA와 핵심 파일 경로
- 필요 시 후속 이슈/작업 계획

예시:

```markdown
@claude 리뷰 코멘트 확인 및 대응 완료했습니다.

- 수정: 3건 (`abc1234`)
- 부분 수용: 1건
- 반론: 1건

주요 반영 파일:

- `apps/api/src/...`
```

## Guardrails

- force push, amend, 리뷰 스레드 강제 resolve 금지
- 리뷰 범위를 벗어난 대규모 변경 금지
- 반론 시에도 정중하고 검증 가능한 근거 제시
