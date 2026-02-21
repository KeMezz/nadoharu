import { PrismaClientProvider } from './prisma-client.provider';

describe('PrismaClientProvider', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  it('DATABASE_URL이 없으면 에러를 던진다', () => {
    delete process.env.DATABASE_URL;

    expect(() => new PrismaClientProvider()).toThrow(
      'DATABASE_URL is required',
    );
  });

  it('onModuleDestroy에서 Prisma와 Pool 연결을 정리한다', async () => {
    process.env.DATABASE_URL =
      'postgresql://nadoharu:nadoharu_dev@localhost:5432/nadoharu';

    const provider = new PrismaClientProvider();
    const disconnectSpy = jest
      .spyOn(provider, '$disconnect')
      .mockResolvedValue(undefined);
    const endSpy = jest
      .spyOn(
        (provider as unknown as { pool: { end: () => Promise<void> } }).pool,
        'end',
      )
      .mockResolvedValue(undefined);

    await provider.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(endSpy).toHaveBeenCalledTimes(1);
  });
});
