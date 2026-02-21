---
name: nestjs-ddd
description: 'NestJS DDD/Clean Architecture 기반 백엔드 코드 작성 지침을 제공합니다. bounded-context, 레이어드 아키텍처, 엔티티/VO/UseCase/Repository 패턴을 일관되게 적용합니다.'
metadata:
  author: nadoharu
  version: '1.0'
---

# NestJS DDD Architecture Guide

이 스킬은 NestJS + TypeScript 프로젝트에서 DDD(Domain-Driven Design)와 Clean Architecture 패턴에 따라 코드를 작성하기 위한 **지침**을 제공합니다. 코드를 직접 생성하지 않고, 어떤 식으로 코드를 구성하고 작성해야 하는지 안내합니다.

사용자의 요청을 분석하여 해당하는 bounded-context와 레이어를 식별하고, 아래 지침에 따라 **구체적인 파일 구조, 코드 패턴, 네이밍 규칙**을 안내합니다.

---

## 1. 전체 아키텍처 원칙

### 1.1 디렉토리 구조

```
src/
├── bounded-contexts/
│   └── <context-name>/          # kebab-case
│       ├── domain/              # 비즈니스 로직 (외부 의존 없음)
│       │   ├── entities/
│       │   │   └── <resource>/
│       │   │       ├── <resource>.entity.ts
│       │   │       ├── <resource>.zod.ts        # 복잡한 바리데이션 필요시
│       │   │       └── __mocks__/
│       │   │           └── <resource>.entity.factory.ts
│       │   ├── value-objects/
│       │   │   └── <resource>/
│       │   │       ├── <resource>.vo.ts
│       │   │       └── <resource>.zod.ts        # 복잡한 바리데이션 필요시
│       │   └── services/                        # 도메인 서비스
│       ├── application/         # 유스케이스 (도메인 층만 의존)
│       │   ├── <feature>/
│       │   │   ├── <action>/                    # get/, save/, create/, list/ 등
│       │   │   │   ├── <resource>-<action>.usecase.ts
│       │   │   │   ├── <resource>-<action>.usecase.spec.ts
│       │   │   │   ├── <resource>-<action>.input.ts
│       │   │   │   └── <resource>-<action>.output.ts
│       │   │   └── <resource>.repository.ts     # 인터페이스
│       └── infrastructure/      # 기술적 구현 (모든 층 의존 가능)
│           ├── controllers/
│           │   ├── rest/
│           │   │   └── <resource>/
│           │   │       ├── <resource>.controller.ts
│           │   │       ├── <resource>.presenter.ts
│           │   │       └── responses/
│           │   │           └── <resource>.response.ts
│           │   └── graphql/
│           │       └── <resource>/
│           │           ├── <resource>.resolver.ts
│           │           └── <resource>.presenter.ts
│           ├── cli/
│           │   ├── scheduled/   # 정기 실행 배치
│           │   └── manual/      # 수동 실행
│           ├── gateways/
│           │   └── prisma/
│           │       └── <resource>/
│           │           ├── prisma-<resource>.repository.ts
│           │           └── <resource>.builder.ts
│           └── nest-js-modules/
│               └── <resource>.module.ts
├── shared-kernel/               # DDD 공유 커널
│   ├── domain/
│   │   ├── value-objects/       # 공유 VO (Email, Pagination 등)
│   │   ├── constants/
│   │   └── errors/
│   ├── application/
│   │   ├── transaction/         # UnitOfWork 인터페이스
│   │   └── errors/              # App*Error 클래스
│   └── infrastructure/
│       └── gateways/prisma/     # Prisma 커넥터, UoW 구현
├── common/                      # 기술적 횡단 관심사
│   ├── middleware/
│   ├── guard/
│   ├── filter/
│   ├── logger/
│   ├── graphql/                 # 스칼라 타입, 데코레이터
│   └── i18n/
└── auth/                        # 인증/인가
    ├── guards/
    ├── decorators/
    └── policies/
```

### 1.2 의존 방향 (절대 규칙)

```
Domain ← Application ← Infrastructure
  ↑          ↑              ↑
  │     (DI 인터페이스)    (구현)
  │          │              │
  └──────────┴──────────────┘
      의존성 역전 원칙 (DIP)
```

- **Domain 층**: 외부 의존 없음. 순수 비즈니스 로직만
- **Application 층**: Domain 층만 의존. 외부 서비스는 인터페이스로 추상화
- **Infrastructure 층**: 모든 층에 의존 가능. 기술적 구현 담당

### 1.3 bounded-context 간 통신

- UseCase를 DI하여 공개 인터페이스로 호출
- Repository나 Entity를 직접 import하지 않음
- bounded-context 간 트랜잭션을 걸지 않음

---

## 2. Domain 층 패턴

### 2.1 Entity

**파일명**: `<resource>.entity.ts`

```typescript
// room.entity.ts
import type { RoomSetting } from './room-setting.entity';

export class Room {
  // 상수는 static readonly로
  static readonly RENT_TYPE = {
    NONE: 0,
    DAY_TIME: 1,
    STAY: 2,
  } as const;

  // 단순 프로퍼티는 readonly로 공개
  readonly id: Props['id'];
  readonly name: Props['name'];
  readonly ownerId: Props['ownerId'];
  readonly roomSetting: Props['roomSetting'];

  constructor(params: Props) {
    this.id = params.id;
    this.name = params.name;
    this.ownerId = params.ownerId;
    this.roomSetting = params.roomSetting;
  }

  // 비즈니스 로직은 메서드로
  isAvailable(): boolean {
    if (this.deletedAt !== null) return false;
    return this.roomSetting.isRentalAvailable();
  }

  calculateTotalPrice(hours: number): number {
    return this.price * hours;
  }
}

// Props 타입은 파일 하단에 정의
type Props = {
  id: number;
  name: string | null; // null 허용시 명시
  ownerId: number;
  roomSetting: RoomSetting;
};
```

**핵심 규칙**:

- 계산 불필요한 프로퍼티: `readonly` 공개
- 민감한 데이터: `readonly #` (hard private) + getter
- 비즈니스 로직: 메서드로 구현
- 생성자에서 불변 조건 보장 (바리데이션)
- Props 타입은 파일 하단에 별도 정의

### 2.2 ValueObject

**파일명**: `<resource>.vo.ts`

```typescript
// password.vo.ts
export class Password {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  // 신규 생성 (바리데이션 포함)
  static create(password: string, passwordConfirmation: string): Password {
    if (!password) {
      throw new Error('패스워드를 입력해 주세요.');
    }
    if (password.length < 8) {
      throw new Error('패스워드는 8자 이상으로 입력해 주세요.');
    }
    if (password !== passwordConfirmation) {
      throw new Error('패스워드가 일치하지 않습니다.');
    }
    return new Password(password);
  }

  // DB에서 복원 (바리데이션 없음)
  static recreate(value: string): Password {
    return new Password(value);
  }

  get value(): string {
    return this.#value;
  }
}
```

**핵심 규칙**:

- `readonly #` (hard private) + getter 패턴
- private constructor + 정적 팩토리 메서드 (`create`, `recreate`)
- `create()`: 신규 생성 (바리데이션 포함)
- `recreate()` / `fromRecord()`: DB 복원 (바리데이션 없음)
- 불변성 보장 (모든 필드 readonly)

### 2.3 Zod 스키마 (복잡한 바리데이션)

**파일명**: `<resource>.zod.ts` (entity/vo와 같은 디렉토리)

```typescript
// owner-bank-account.zod.ts
import { z } from 'zod';

const Schema = z.strictObject({
  bankCode: z.preprocess(normalizeDigits, z.string().regex(/^\d{4}$/)),
  branchCode: z.preprocess(normalizeDigits, z.string().regex(/^\d{3}$/)),
  accountNumber: z.preprocess(normalizeDigits, z.string().regex(/^\d{7}$/)),
});

export type OwnerBankAccountCleaned = z.infer<typeof Schema>;

export const cleanOwnerBankAccount = (
  params: unknown,
): OwnerBankAccountCleaned => {
  const r = Schema.safeParse(params);
  if (!r.success) {
    throw new Error(r.error.issues.map((i) => i.message).join('\n'));
  }
  return r.data;
};
```

**판단 기준**:

- 단순 바리데이션 (길이, 범위 등): `if`문
- 복잡한 바리데이션 (상호 검증, 데이터 정규화): Zod 스키마

### 2.4 Domain Service

복수 Entity에 걸치는 비즈니스 로직이나 Entity에 속하지 않는 도메인 로직.

---

## 3. Application 층 패턴

### 3.1 UseCase

**파일명**: `<resource>-<action>.usecase.ts`

```typescript
// room-get.usecase.ts
import { Inject, Injectable } from '@nestjs/common';
import { RoomRepository } from '../room.repository';
import type { RoomGetInput } from './room-get.input';
import type { RoomGetOutput } from './room-get.output';

@Injectable()
export class RoomGetUseCase {
  readonly #roomRepository: RoomRepository;

  constructor(@Inject(RoomRepository) roomRepository: RoomRepository) {
    this.#roomRepository = roomRepository;
  }

  async handle(input: RoomGetInput): Promise<RoomGetOutput | null> {
    const room = await this.#roomRepository.findById({ id: input.id });
    if (!room) return null;

    return {
      id: room.id,
      name: room.name,
    };
  }
}
```

**핵심 규칙**:

- 모든 UseCase는 `handle` 메서드로 통일
- DI 의존은 `readonly #` (hard private)
- `@Inject()` 데코레이터로 인터페이스 토큰 지정
- Entity를 직접 반환하지 않음 (Output DTO로 변환)
- Input/Output은 별도 파일 (`*.input.ts`, `*.output.ts`)
- 에러는 `App*Error`계 도메인 예외 사용
- private 메서드는 `#methodName` 형태

### 3.2 트랜잭션 (Unit of Work)

```typescript
@Injectable()
export class UserCreateUseCase {
  readonly #unitOfWorkFactory: UnitOfWorkFactory;
  readonly #userRepository: UserRepository;

  constructor(
    @Inject(UnitOfWorkFactory) unitOfWorkFactory: UnitOfWorkFactory,
    @Inject(UserRepository) userRepository: UserRepository,
  ) {
    this.#unitOfWorkFactory = unitOfWorkFactory;
    this.#userRepository = userRepository;
  }

  async handle(input: Input): Promise<Output> {
    return await this.#unitOfWorkFactory.get('main').run(async () => {
      // 이 안의 처리는 모두 동일 트랜잭션 내에서 실행
      return await this.#userRepository.save(entity);
    });
  }
}
```

**핵심 규칙**:

- `UnitOfWorkFactory.get('main' | 'search' | 'log')` 으로 DB별 UoW 취득
- `unitOfWork.run()` 안의 처리가 동일 트랜잭션
- bounded-context를 넘어 트랜잭션을 걸지 않음

### 3.3 Repository 인터페이스

**파일명**: `<resource>.repository.ts` (application 층에 배치)

```typescript
// room.repository.ts
import type { Pagination } from '@/shared-kernel/domain/value-objects';
import type { Room } from '../../domain/entities/room/room.entity';

export interface RoomRepository {
  findById(args: { id: number } | { uid: string }): Promise<Room | null>;
  findByIds(args: { ids: number[]; withDeleted: boolean }): Promise<Room[]>;
  findAll(args: { ownerId: number; pagination: Pagination }): Promise<Room[]>;
  save(room: Room): Promise<void>;
  saveAll(rooms: Room[]): Promise<void>;
}

// DI 토큰 (CamelCase = 'SCREAMING_SNAKE')
export const RoomRepository = 'ROOM_REPOSITORY';
```

**핵심 규칙**:

- 인터페이스는 application 층에 배치
- DI 토큰: `export const Xxx = 'XXX_YYY'` 형식
- 등록/수정은 `save` / `saveAll`로 통일 (create/update 분리하지 않음)
- 일람 취득은 `findAll`로 통일
- 인터페이스명은 범용적 (구현 클래스에 서비스 고유명)

### 3.4 에러 핸들링

```typescript
// UseCase에서 App*Error 사용
import { AppBadRequestError } from '@/shared-kernel/application/errors/app-bad-request.error';
import { AppNotFoundError } from '@/shared-kernel/application/errors/app-not-found.error';
import { AppForbiddenError } from '@/shared-kernel/application/errors/app-forbidden.error';

// 도메인 객체의 바리데이션 에러를 캐치
const entity = (() => {
  try {
    return new SomeEntity(input);
  } catch (error) {
    throw new AppBadRequestError((error as Error).message);
  }
})();

// 존재 확인
if (!entity) {
  throw new AppNotFoundError('대상을 찾을 수 없습니다');
}

// 권한 확인
if (entity.ownerId !== currentUserId) {
  throw new AppForbiddenError();
}
```

### 3.5 로그

```typescript
import { WINSTON_LOGGER } from '@/common/logger/winston-logger.module'
import type { Logger } from 'winston'

constructor(@Inject(WINSTON_LOGGER) private readonly logger: Logger) {}

// console.log 사용 금지. 반드시 Logger 사용
this.logger.info('Processing room creation', { userId: input.userId })
this.logger.error('Failed to create room', { error: error.message })
```

---

## 4. Infrastructure 층 패턴

### 4.1 Prisma Repository 구현

**파일명**: `prisma-<resource>.repository.ts`

```typescript
// prisma-room.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaMainUnitOfWork } from '@/shared-kernel/infrastructure/gateways/prisma/transaction/prisma-main.unit-of-work';
import type { RoomRepository } from '@/bounded-contexts/asset/application/room/room.repository';
import { buildRoomEntity } from './room.builder';

@Injectable()
export class PrismaRoomRepository implements RoomRepository {
  readonly #unitOfWork: PrismaMainUnitOfWork;

  constructor(unitOfWork: PrismaMainUnitOfWork) {
    this.#unitOfWork = unitOfWork;
  }

  async findById(args: { id: number }): Promise<Room | null> {
    const result = await this.#unitOfWork.client.rooms.findFirst({
      where: { ...args, deletedAt: null },
      include: { roomSettings: { where: { deletedAt: null } } },
    });
    return result ? buildRoomEntity(result, result.roomSettings[0]) : null;
  }

  async save(room: Room): Promise<void> {
    await this.#unitOfWork.client.room.upsert({
      where: { id: room.id },
      update: { name: room.name },
      create: { id: room.id, name: room.name },
    });
  }
}
```

**핵심 규칙**:

- `#unitOfWork.client`로 트랜잭션 클라이언트 취득
- Builder 패턴으로 Prisma 결과 → Entity 변환
- 논리 삭제: `deletedAt: null` 명시
- `App*Error` 사용하지 않음 (null 반환 또는 Error)
- upsert 활용 (unique key가 있는 경우)

### 4.2 Builder

**파일명**: `<resource>.builder.ts`

```typescript
// room.builder.ts
import { Room } from '@/bounded-contexts/asset/domain/entities/room/room.entity';
import type { Rooms, RoomSettings } from 'prisma/generated/main';

export const buildRoomEntity = (
  room: Rooms,
  roomSetting: RoomSettings,
): Room => {
  return new Room({
    id: room.id,
    name: room.name,
    ownerId: room.ownerId ?? 0,
    roomSetting: buildRoomSettingEntity(roomSetting),
  });
};
```

**핵심 규칙**:

- 순수 함수 (클래스 아님)
- Prisma 타입 → Domain Entity 매핑
- 기본값은 `??` 연산자로

### 4.3 Controller (REST)

**파일명**: `<resource>.controller.ts`

```typescript
// room.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RoomListUseCase } from '@/bounded-contexts/asset/application/room/list/room-list.usecase';
import { RoomPresenter } from './room.presenter';

@Controller('/1/rooms')
export class RoomController {
  readonly #roomListUseCase: RoomListUseCase;
  readonly #roomPresenter: RoomPresenter;

  constructor(roomListUseCase: RoomListUseCase, i18nService: I18nService) {
    this.#roomListUseCase = roomListUseCase;
    this.#roomPresenter = new RoomPresenter(i18nService);
  }

  @Get()
  async findAll(@Query('page') page?: string): Promise<RoomResponse> {
    const result = await this.#roomListUseCase.handle({
      page: page == null ? 1 : Number(page),
    });
    return this.#roomPresenter.toResponse(result);
  }
}
```

### 4.4 Presenter

**파일명**: `<resource>.presenter.ts`

```typescript
// room.presenter.ts
export class RoomPresenter {
  readonly #i18nService: I18nService;

  constructor(i18nService: I18nService) {
    this.#i18nService = i18nService;
  }

  toResponse(output: RoomListOutput): RoomResponse {
    return {
      results: output.rooms.map((room) => ({
        id: room.id,
        name: room.name ?? '',
        // i18n 변환은 Presenter 책임
        state_text: this.#i18nService.translate(
          `master.large_area.${room.state}`,
        ),
      })),
      totalCount: output.totalCount,
    };
  }
}
```

**핵심 규칙**:

- 표시 로직은 Presenter에서 (Entity에 넣지 않음)
- i18n 변환은 Presenter 책임
- Entity는 코드값 보유, Presenter에서 일본어화

### 4.5 NestJS Module

**파일명**: `<resource>.module.ts`

```typescript
// room.module.ts
import { Module, forwardRef } from '@nestjs/common';

@Module({
  imports: [PrismaModule, forwardRef(() => RelatedModule)],
  controllers: [RoomController],
  providers: [
    // UseCase
    RoomGetUseCase,
    RoomListUseCase,
    // Repository (토큰 기반 DI)
    { provide: RoomRepository, useClass: PrismaRoomRepository },
    // Resolver/Presenter
    RoomResolver,
  ],
  exports: [
    RoomGetUseCase, // 다른 context에서 사용 가능
    RoomRepository, // 인터페이스 공개
  ],
})
export class RoomModule {}
```

**핵심 규칙**:

- `{ provide: InterfaceToken, useClass: Implementation }` 패턴
- 순환 의존은 `forwardRef()` 사용
- exports에는 공개 UseCase와 Repository 인터페이스만

### 4.6 CLI (배치)

**파일명**: `<command-name>.cli.ts`

```typescript
import { Command, CommandRunner, Option } from 'nest-commander';
import { WinstonLogger } from '@/common/logger/winston-logger.service';

@Command({
  name: '<context>:<command-name>', // 예: config:sync-data
  description: '커맨드 설명',
})
export class SyncDataCli extends CommandRunner {
  readonly #logger: WinstonLogger;

  constructor(logger: WinstonLogger) {
    super();
    this.#logger = logger;
    this.#logger.setContext(SyncDataCli.name);
  }

  async run(_passedParam: string[], options?: Options): Promise<void> {
    this.#logger.log('Sync started');
    // 처리 로직
  }

  @Option({ flags: '-d, --dry-run', description: 'Dry run mode' })
  parseDryRun(val: string): boolean {
    return val === 'true';
  }
}
```

---

## 5. 테스트 패턴

### 5.1 UseCase 단체 테스트 (`.spec.ts`)

```typescript
describe('RoomGetUseCase', () => {
  let moduleRef: TestingModule;
  let useCase: RoomGetUseCase;

  const mockFindById: jest.Mock = jest.fn();

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        RoomGetUseCase,
        {
          provide: RoomRepository,
          useValue: { findById: mockFindById },
        },
        {
          provide: UnitOfWorkFactory,
          useValue: {
            get: () => ({
              run: async <T>(fn: () => Promise<T>): Promise<T> => fn(),
            }),
          },
        },
      ],
    }).compile();

    await moduleRef.init();
    useCase = moduleRef.get(RoomGetUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    moduleRef.close();
  });

  describe('handle', () => {
    it('Room이 존재하는 경우, Output을 반환할 것', async () => {
      mockFindById.mockResolvedValue(RoomEntityFactory.build());
      const result = await useCase.handle({ id: 1 });
      expect(result).toMatchObject({ id: 1 });
    });

    it('Room이 존재하지 않는 경우, null을 반환할 것', async () => {
      mockFindById.mockResolvedValue(null);
      const result = await useCase.handle({ id: 999 });
      expect(result).toBeNull();
    });
  });
});
```

### 5.2 Entity/VO 단체 테스트 (`.spec.ts`)

```typescript
describe('Password', () => {
  describe('create', () => {
    it('유효한 패스워드인 경우, 생성할 수 있을 것', () => {
      const password = Password.create('password123', 'password123');
      expect(password.value).toBe('password123');
    });

    it('8자 미만인 경우, 에러가 발생할 것', () => {
      expect(() => Password.create('short', 'short')).toThrow('8자 이상');
    });
  });
});
```

### 5.3 통합 테스트 (`.integration.spec.ts`)

```typescript
describe('GET /1/rooms (integration)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Room 일람을 취득할 수 있을 것', async () => {
    const response = await request(app.getHttpServer()).get(
      '/1/rooms?owner_id=test',
    );
    expect(response.status).toBe(200);
  });

  it('미인증의 경우, 401을 반환할 것', async () => {
    const response = await request(app.getHttpServer()).get('/1/rooms');
    expect(response.status).toBe(401);
  });
});
```

### 5.4 Mock Factory (fishery)

**파일명**: `__mocks__/<resource>.entity.factory.ts`

```typescript
import { Factory } from 'fishery';
import { Room } from '../room.entity';

export const RoomEntityFactory = Factory.define<Room>(({ sequence }) => {
  return new Room({
    id: sequence,
    name: `Room ${sequence}`,
    ownerId: sequence,
    roomSetting: RoomSettingEntityFactory.build({ roomId: sequence }),
  });
});
```

### 5.5 테스트 방침

| 대상                | 방식                    | 파일                    |
| ------------------- | ----------------------- | ----------------------- |
| Domain (entity/vo)  | Mock 불필요 (순수 로직) | `*.spec.ts`             |
| UseCase             | 외부 의존은 Mock        | `*.spec.ts`             |
| Repository          | DB 결합 테스트          | `*.spec.ts`             |
| Controller/Resolver | 해피패스는 DB 결합      | `*.integration.spec.ts` |
| Controller/Resolver | 세부 분기는 Mock        | `*.spec.ts`             |

---

## 6. 코딩 규약

### 6.1 TypeScript

- **Hard Private (`#`)**: DI 의존, 민감 데이터에 사용
- **`readonly`**: 모든 불변 프로퍼티에 적용
- **`import type`**: 타입만 import할 때 반드시 사용
- **null 타입**: `number | null` 형태로 명시 (`null` 단독 사용 금지)
- **switch 망라성**: default에 `never` 체크 (`assertUnreachable` 패턴)
- **enum 대신 Union Type**: `type Status = 'active' | 'inactive'`

### 6.2 네이밍 규칙

| 항목        | 규칙                    | 예시                            |
| ----------- | ----------------------- | ------------------------------- |
| 파일        | kebab-case              | `room-get.usecase.ts`           |
| Entity      | PascalCase              | `Room`, `RoomSetting`           |
| ValueObject | PascalCase + `.vo.ts`   | `Email`, `Password`             |
| UseCase     | PascalCase + UseCase    | `RoomGetUseCase`                |
| Repository  | PascalCase + Repository | `RoomRepository`                |
| DI 토큰     | `SCREAMING_SNAKE`       | `'ROOM_REPOSITORY'`             |
| Builder     | `build<Entity>Entity`   | `buildRoomEntity()`             |
| Presenter   | PascalCase + Presenter  | `RoomPresenter`                 |
| CLI         | PascalCase + Cli        | `HelloCli`                      |
| Module      | PascalCase + Module     | `RoomModule`                    |
| 테스트 이름 | 일본어(또는 한국어)     | `it('Room이 존재하는 경우...')` |

### 6.3 함수 인자

```typescript
// 인자가 복수인 경우 object 형식
function calculatePrice({
  basePrice,
  discount,
}: {
  basePrice: number;
  discount: number;
}) {
  return basePrice * (1 - discount);
}

// boolean은 명시적 지정
const user = await this.userRepository.findById(id, { includeDeleted: false });
```

### 6.4 환경 변수

```typescript
// getOrThrow로 필수 체크 (constructor에서)
constructor(private readonly configService: ConfigService) {
  this.#apiUrl = this.configService.getOrThrow<string>('API_URL')
}
```

### 6.5 HTTP 클라이언트

- `axios` 사용 (fetch 아님)

---

## 7. 개발 프로세스

### 7.1 개발 순서

1. **Domain 층부터** (안쪽에서 바깥으로)
2. Entity/VO 정의 → 테스트 작성
3. Application 층 (UseCase, Repository 인터페이스) → 테스트 작성
4. Infrastructure 층 (Prisma Repository, Controller, Module) → 테스트 작성

### 7.2 TDD 사이클

1. 가장 단순한 실패 테스트 작성 (Red)
2. 테스트를 통과하는 최소한의 코드 작성 (Green)
3. 테스트가 통과하는 경우에만 리팩토링 (Refactor)
4. 각 사이클에서 커밋

### 7.3 커밋

- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- **소규모 빈번한 커밋**: 1기능 1커밋, 테스트와 구현은 동일 커밋

### 7.4 체크리스트

- [ ] Hard private (`#`) 사용
- [ ] public 메서드 최소한
- [ ] `import type` 사용
- [ ] 논리 삭제에서 `deletedAt: null` 명시
- [ ] 불필요한 코멘트 삭제
- [ ] 코드 설명 코멘트 삭제 (의도 설명은 남김)
- [ ] N+1 문제 고려
- [ ] `yarn tsc --noEmit` 통과
- [ ] `yarn lint` 통과
- [ ] `yarn test` 통과

---

## 8. 사용자에게 안내할 때의 흐름

사용자가 새 기능 또는 bounded-context 작성을 요청하면:

1. **어떤 bounded-context에 속하는지** 확인
2. **어떤 레이어부터 작업할지** 안내 (Domain → Application → Infrastructure)
3. **해당 레이어의 파일 구조와 패턴** 제시
4. **코드 템플릿**과 함께 핵심 규칙 안내
5. **테스트 패턴** 안내
6. **Module 등록 방법** 안내

항상 **기존 코드와의 일관성**을 최우선으로 하고, 유사 기능이 있으면 참조하도록 안내합니다.
