# .legacy 운영 규칙

`.legacy`는 프론트엔드 디자인 이식 기간 동안 레거시 레퍼런스를 로컬에 두기 위한 임시 디렉터리입니다.

## 목적

- `apps/web` UI/UX 구현 시 레거시 디자인/인터랙션을 빠르게 참조
- 레거시 코드를 Git 이력에 포함하지 않고 로컬 전용으로 관리

## 사용 방법

```bash
mkdir -p .legacy
git clone https://github.com/GuitarCoders/nadoharu-front .legacy/nadoharu-front
```

## 필수 규칙

- `.legacy/nadoharu-front`는 참고용이며, 본 레포에서 import 대상으로 사용하지 않는다.
- 데이터 계약/GraphQL/라우팅/상태 관리는 현재 모노레포 기준으로 구현한다.
- PR/스펙/문서에 로컬 절대 경로(예: `/home/...`)를 기록하지 않는다.
- `.legacy` 하위는 Git 추적 대상이 아니며, 이 파일(`.legacy/README.md`)만 추적한다.

## 종료 기준

- 프론트엔드 디자인 이식이 완료되면 `.legacy` 운영 규칙을 제거 또는 완화한다.
