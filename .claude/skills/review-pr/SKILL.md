---
name: review-pr
description: >
  GitHub PR을 분석하여 플랜/문서 PR이면 Plan Review, 코드 PR이면 Code Review를 수행하고,
  인라인 코멘트가 포함된 리뷰를 GitHub에 직접 등록합니다.
  트리거: "review pr", "PR 리뷰", "리뷰해줘"
metadata:
  author: hyeongjin
  version: "1.0"
---

# Review PR

GitHub PR을 분석하여 적절한 리뷰를 수행하고, 인라인 코멘트와 함께 GitHub에 리뷰를 등록한다.

**Input**: PR 번호 또는 GitHub PR URL. 없으면 현재 브랜치의 열린 PR을 자동 감지.

## Steps

### 1. PR 정보 수집

아래 명령을 실행하여 PR의 전체 정보를 수집한다:

```bash
gh pr view <PR번호> --json title,body,state,baseRefName,headRefName,files,additions,deletions,commits,author,url
```

수집할 정보:
- 제목, 본문, 상태
- 변경 파일 목록 (파일 경로, 추가/삭제 행 수)
- 커밋 히스토리
- 전체 추가/삭제 행 수

### 2. PR 유형 판별

변경 파일의 확장자와 경로를 분석하여 PR 유형을 판별한다:

**Plan/Docs PR** (다음 조건 중 하나 이상 해당):
- 변경 파일이 모두 `.md`, `.yaml`, `.yml`, `.json` (설정 파일)
- `openspec/`, `docs/`, `.github/`, `.claude/` 경로의 파일만 변경
- 코드 파일(`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go` 등)이 없음

**Code PR** (다음 조건 중 하나 이상 해당):
- `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.java`, `.c`, `.cpp` 등 코드 파일 변경 포함
- `src/`, `lib/`, `app/`, `pages/`, `components/` 등 코드 디렉토리 변경 포함

**Mixed PR**: 문서와 코드가 함께 변경된 경우 — Code PR로 취급하되, 문서 부분도 Plan Review 기준으로 함께 평가

### 3. 전체 Diff 수집

```bash
gh pr diff <PR번호>
```

diff 전문을 읽고 변경 내용을 상세히 파악한다.

### 4. 리뷰 수행

PR 유형에 따라 적절한 스킬을 호출하여 리뷰를 수행한다.

#### 4-A. Plan/Docs PR → `/oh-my-claudecode:review` 스킬 호출

**반드시 `/oh-my-claudecode:review` 스킬을 호출**하여 Plan Review를 수행한다. 호출 시 PR 정보(제목, 변경 파일, diff 내용)를 인자로 전달한다.

다음 기준으로 평가한다:

| 기준 | 표준 |
|------|------|
| **명확성 (Clarity)** | 80% 이상의 주장이 파일/라인 참조를 포함하는가? 모호한 표현이 없는가? |
| **테스트 가능성 (Testability)** | 90% 이상의 수용 기준이 구체적이고 검증 가능한가? |
| **검증 (Verification)** | 참조된 파일이 실제로 존재하는가? 문서 간 내용이 일관적인가? |
| **구체성 (Specificity)** | 모호한 표현("적절한", "충분한")이 없는가? 버전, 경로, 설정값이 명시되어 있는가? |
| **위험 식별 (Risk)** | 위험 요소가 식별되어 있는가? 완화 전략이 있는가? |
| **검증 단계 (Verification Steps)** | 구현 후 검증 방법이 정의되어 있는가? |
| **문서 간 일관성** | 관련 문서들(spec, design, tasks 등) 사이에 불일치가 없는가? |

**최종 판정**: APPROVED / REVISE / REJECT

#### 4-B. Code PR → `/oh-my-claudecode:code-review` 스킬 호출

**반드시 `/oh-my-claudecode:code-review` 스킬을 호출**하여 Code Review를 수행한다. 호출 시 PR 정보(제목, 변경 파일, diff 내용)를 인자로 전달한다.

다음 기준으로 평가한다:

| 기준 | 표준 |
|------|------|
| **정확성 (Correctness)** | 로직 오류, 오프바이원, null 처리 누락 등 버그가 없는가? |
| **보안 (Security)** | OWASP Top 10 취약점 (XSS, SQL Injection, 인증 우회 등)이 없는가? |
| **성능 (Performance)** | N+1 쿼리, 불필요한 재렌더링, 메모리 누수 등이 없는가? |
| **유지보수성 (Maintainability)** | 네이밍, 구조, 중복 코드, 관심사 분리가 적절한가? |
| **테스트 (Testing)** | 변경된 코드에 대한 테스트가 있는가? 커버리지가 충분한가? |
| **아키텍처 (Architecture)** | 기존 아키텍처 패턴을 따르는가? 의존 방향이 올바른가? |
| **에러 처리 (Error Handling)** | 예외 상황이 적절히 처리되는가? |

**최종 판정**: APPROVED / CHANGES_REQUESTED / COMMENT

### 5. 인라인 코멘트 라인 번호 확인

리뷰에서 발견된 이슈를 인라인 코멘트로 작성하기 위해, PR 브랜치의 파일에서 정확한 라인 번호를 확인한다:

```bash
# PR 브랜치의 파일에서 키워드로 정확한 라인 번호 검색
git show <PR-head-branch>:<파일경로> | grep -n "<키워드>"
```

각 이슈에 대해:
- **인라인 코멘트 가능**: 특정 파일의 특정 라인에 대한 이슈 → 인라인 코멘트로 작성
- **인라인 코멘트 불가**: 전반적 구조나 누락에 대한 이슈 → 전체 리뷰 본문에 포함

### 6. GitHub 리뷰 등록

수집한 리뷰 내용과 인라인 코멘트를 JSON 페이로드로 구성하여 GitHub API로 리뷰를 등록한다.

#### 6-1. Head commit SHA 확인

```bash
gh pr view <PR번호> --json headRefOid --jq '.headRefOid'
```

#### 6-2. 리뷰 JSON 페이로드 작성

`/tmp/pr-review-<PR번호>.json` 파일에 다음 구조로 작성:

```json
{
  "commit_id": "<HEAD_SHA>",
  "event": "<COMMENT|APPROVE|REQUEST_CHANGES>",
  "body": "<전체 리뷰 본문 (마크다운)>",
  "comments": [
    {
      "path": "<파일 경로>",
      "line": <라인 번호>,
      "side": "RIGHT",
      "body": "<인라인 코멘트 (마크다운)>"
    }
  ]
}
```

**event 매핑**:
- Plan Review의 `APPROVED` → `"COMMENT"` (GitHub에서 non-maintainer는 APPROVE 불가할 수 있음)
- Plan Review의 `REVISE` / `REJECT` → `"COMMENT"`
- Code Review의 `APPROVED` → `"APPROVE"`
- Code Review의 `CHANGES_REQUESTED` → `"REQUEST_CHANGES"`
- Code Review의 `COMMENT` → `"COMMENT"`

#### 6-3. API 호출

```bash
gh api repos/<owner>/<repo>/pulls/<PR번호>/reviews --input /tmp/pr-review-<PR번호>.json
```

### 7. 결과 보고

사용자에게 다음을 출력한다:
- PR 유형 (Plan/Docs vs Code)
- 최종 판정 (APPROVED / REVISE / REJECT / CHANGES_REQUESTED)
- 등록된 인라인 코멘트 수
- 리뷰 URL

## 인라인 코멘트 작성 규칙

### Conventional Comments 형식

인라인 코멘트는 [Conventional Comments](https://conventionalcomments.org/) 스타일을 따른다:

```
<label> [decoration]: <subject>

[discussion]
```

#### 라벨 (Labels)

| 라벨 | 용도 |
|------|------|
| `praise:` | 잘 작성된 부분에 대한 칭찬 |
| `nitpick:` | 사소한 스타일/포맷 지적 (항상 non-blocking) |
| `suggestion:` | 코드 개선 제안 |
| `issue:` | 반드시 수정해야 하는 문제 (기본 blocking) |
| `question:` | 의도나 맥락에 대한 질문 |
| `thought:` | 리뷰어의 생각 공유 (아이디어, 향후 고려사항) |
| `chore:` | 사소한 정리 작업 (리팩터, 임포트 정리 등) |
| `note:` | 강조하고 싶은 참고 사항 |

#### 데코레이션 (Decorations)

| 데코레이션 | 의미 |
|------------|------|
| `(blocking)` | 머지 전 반드시 해결 필요 (= P1) |
| `(non-blocking)` | 해결 권장이지만 머지 차단하지 않음 (= P2/P3) |
| `(if-minor)` | 작은 수정이면 이번에 반영, 아니면 후속 작업 |

#### 작성 예시

```markdown
issue (blocking): null 체크 누락

`user.profile`이 undefined일 수 있는데 optional chaining 없이 접근하고 있습니다.

```suggestion
const name = user.profile?.name ?? 'Unknown';
```
```

```markdown
suggestion (non-blocking): 상수 추출 고려

매직 넘버 `30`이 여러 곳에서 반복됩니다. 상수로 추출하면 유지보수성이 향상됩니다.
```

```markdown
praise: 깔끔한 에러 핸들링

커스텀 에러 타입으로 분기 처리한 부분이 읽기 좋습니다.
```

#### 우선순위 매핑

기존 우선순위와의 대응:
- `P1` (블로킹) → `issue (blocking):` 또는 `suggestion (blocking):`
- `P2` (강력 권장) → `suggestion (non-blocking):` 또는 `issue (non-blocking):`
- `P3` (개선 제안) → `nitpick:`, `thought:`, `chore:`

### suggestion 블록 활용

코드/텍스트 수정을 제안할 때는 GitHub suggestion 블록을 사용한다:

````markdown
```suggestion
수정된 내용
```
````

이렇게 하면 리뷰이가 "Apply suggestion" 버튼으로 바로 적용할 수 있다.

### 멀티라인 코멘트

여러 줄에 걸친 이슈는 `start_line`과 `line` 필드를 함께 사용한다:

```json
{
  "path": "file.md",
  "start_line": 10,
  "line": 15,
  "side": "RIGHT",
  "body": "이 범위에 대한 코멘트"
}
```

## 전체 리뷰 본문 구조

### Plan/Docs PR 리뷰 본문

```markdown
## PR #<번호> 리뷰

<1-2줄 총평>

### 판정: <APPROVED / REVISE / REJECT> (조건부 여부)

> <판정 근거 한 줄>

### 평가 요약

| 기준 | 평가 |
|------|------|
| 명확성 | <평가> |
| 테스트 가능성 | <평가> |
| 검증 | <평가> |
| 구체성 | <평가> |
| 위험 식별 | <평가> |
| 검증 단계 | <평가> |
| 문서 간 일관성 | <평가> |

### 후속 작업 권장

1. ...
2. ...
```

### Code PR 리뷰 본문

```markdown
## PR #<번호> 코드 리뷰

<1-2줄 총평>

### 판정: <APPROVED / CHANGES_REQUESTED / COMMENT>

> <판정 근거 한 줄>

### 평가 요약

| 기준 | 평가 |
|------|------|
| 정확성 | <평가> |
| 보안 | <평가> |
| 성능 | <평가> |
| 유지보수성 | <평가> |
| 테스트 | <평가> |
| 아키텍처 | <평가> |
| 에러 처리 | <평가> |

### 주요 발견 사항

1. ...
2. ...
```

## Guardrails

- 리뷰 대상이 아닌 파일(자동 생성 파일, lock 파일 등)은 건너뛴다
- 인라인 코멘트는 반드시 PR diff에 포함된 라인에만 작성한다 (변경되지 않은 라인에는 불가)
- 리뷰 본문이 너무 길지 않도록 핵심만 간결하게 작성한다
- suggestion 블록은 단일 파일의 연속된 라인에만 사용한다
- PR이 이미 닫혔거나 머지된 경우 리뷰를 등록하지 않고 사용자에게 알린다
- 자신이 작성자인 PR에도 리뷰를 등록할 수 있다 (self-review)
