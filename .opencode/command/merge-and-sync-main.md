---
description: PR을 머지하고 로컬 main 브랜치를 최신으로 동기화합니다.
---

GitHub PR을 머지한 뒤 로컬 `main` 브랜치를 `origin/main`과 동기화한다.

**Input**: `/merge-and-sync-main` 뒤 인자(선택: PR 번호 또는 PR URL, 선택: `--squash`/`--rebase`)

## Steps

1. **사전 점검**
   - `git status --short`로 작업 트리가 깨끗한지 확인한다. 변경사항이 있으면 중단한다.
   - `git branch --show-current`로 현재 브랜치를 확인한다.
   - PR 인자가 없으면 `gh pr view --json number,state,headRefName,baseRefName,url`로 현재 브랜치의 열린 PR을 자동 감지한다.

2. **PR 상태 확인**
   - `gh pr view <PR번호> --json number,title,state,isDraft,headRefName,baseRefName,url`
   - `state`가 `OPEN`인지 확인한다. `CLOSED`/`MERGED`면 중단한다.
   - `isDraft`가 `true`면 중단한다.
   - 기본 기준은 `baseRefName=main`이며, 다른 base PR은 안내 후 중단한다.

3. **PR 머지**
   - 기본 전략은 merge commit:
     - `gh pr merge <PR번호> --merge`
   - 인자에 `--squash` 또는 `--rebase`가 있으면 해당 전략으로 머지한다.
   - 머지 후 `gh pr view <PR번호> --json state,mergedAt,mergeCommit,url`로 성공을 검증한다.

4. **로컬 main 동기화**
   - `git checkout main`
   - `git pull --ff-only`
   - `git status --short`로 작업 트리 clean 상태를 재확인한다.

5. **결과 출력**
   - 머지된 PR URL
   - 머지 커밋 SHA
   - 동기화 완료된 로컬 브랜치(`main`)

## Guardrails

- PR 상태가 `OPEN`이 아니면 머지를 시도하지 않는다.
- 작업 트리가 dirty면 동기화를 진행하지 않는다.
- `--admin`, `--auto`, `--delete-branch`는 사용자 요청 시에만 사용한다.
- force push, amend, `git rebase -i` 금지.
