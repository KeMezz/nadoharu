export interface TokenPayload {
  sub: string;
  accountId: string;
  iat?: number;
  exp?: number;
}

export interface TokenService {
  sign(payload: Pick<TokenPayload, 'sub' | 'accountId'>): string;
  verify(token: string): TokenPayload;
}
