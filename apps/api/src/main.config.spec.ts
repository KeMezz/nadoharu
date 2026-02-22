import { resolveCorsOrigin } from './main.config';

describe('resolveCorsOrigin', () => {
  it('개발 환경에서는 모든 origin을 허용한다', () => {
    const result = resolveCorsOrigin({ NODE_ENV: 'development' });

    expect(result).toBe(true);
  });

  it('운영 환경에서 CORS_ORIGIN이 있으면 해당 origin을 사용한다', () => {
    const result = resolveCorsOrigin({
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://nadoharu.example.com',
    });

    expect(result).toBe('https://nadoharu.example.com');
  });

  it('운영 환경에서 CORS_ORIGIN이 없으면 예외를 던진다', () => {
    expect(() => resolveCorsOrigin({ NODE_ENV: 'production' })).toThrow(
      'CORS_ORIGIN environment variable is required in production',
    );
  });
});
