import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      DATABASE_URL:
        'postgresql://nadoharu:nadoharu_test@localhost:5432/nadoharu_test',
      JWT_SECRET: 'jwt-secret-key-with-at-least-32-characters',
      JWT_EXPIRES_IN: '15m',
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
    process.env = originalEnv;
  });

  it('모듈이 정상적으로 생성되어야 한다', () => {
    expect(module).toBeDefined();
  });
});
