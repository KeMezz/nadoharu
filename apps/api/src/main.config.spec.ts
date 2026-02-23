import { resolveCorsOrigin, resolveTrustProxy } from './main.config';

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

describe('resolveTrustProxy', () => {
  it('운영 환경에서 TRUST_PROXY_HOPS가 없으면 기본값 1을 사용한다', () => {
    const result = resolveTrustProxy({ NODE_ENV: 'production' });

    expect(result).toBe(1);
  });

  it('비운영 환경에서 TRUST_PROXY_HOPS가 없으면 trust proxy를 비활성화한다', () => {
    const result = resolveTrustProxy({ NODE_ENV: 'development' });

    expect(result).toBeNull();
  });

  it('TRUST_PROXY_HOPS가 있으면 환경과 무관하게 해당 홉 수를 사용한다', () => {
    const result = resolveTrustProxy({
      NODE_ENV: 'staging',
      TRUST_PROXY_HOPS: '2',
    });

    expect(result).toBe(2);
  });

  it('TRUST_PROXY_HOPS가 유효하지 않으면 예외를 던진다', () => {
    expect(() =>
      resolveTrustProxy({
        NODE_ENV: 'staging',
        TRUST_PROXY_HOPS: 'abc',
      }),
    ).toThrow('TRUST_PROXY_HOPS must be a non-negative integer');
  });
});
