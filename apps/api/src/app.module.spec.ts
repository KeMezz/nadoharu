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
      R2_ENDPOINT: 'https://example-r2.cloudflare.com',
      R2_BUCKET_NAME: 'nadoharu-post-images',
      R2_ACCESS_KEY_ID: 'test-access-key',
      R2_SECRET_ACCESS_KEY: 'test-secret-key',
      R2_PUBLIC_URL: 'https://cdn.example.com',
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    process.env = originalEnv;
  });

  it('모듈이 정상적으로 생성되어야 한다', () => {
    expect(module).toBeDefined();
  });
});
