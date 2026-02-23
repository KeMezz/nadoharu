import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
  test('로그인 폼을 렌더링한다', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /나.*도.*하.*루/ })).toBeVisible();
    await expect(page.getByLabel(/아이디/i)).toBeVisible();
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  });

  test('회원가입 링크가 존재한다', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('link', { name: /회원가입/i })).toBeVisible();
  });

  test('소셜 로그인 버튼이 비활성 상태이다', async ({ page }) => {
    await page.goto('/login');

    const appleButton = page.getByLabel(/Apple.*준비 중/i);
    const kakaoButton = page.getByLabel(/Kakao.*준비 중/i);
    const githubButton = page.getByLabel(/GitHub.*준비 중/i);

    await expect(appleButton).toBeDisabled();
    await expect(kakaoButton).toBeDisabled();
    await expect(githubButton).toBeDisabled();
  });

  test('잘못된 자격 증명으로 로그인 시 에러를 표시한다', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/아이디/i).fill('wronguser');
    await page.getByLabel(/비밀번호/i).fill('WrongPassword1!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();

    await expect(page.locator('p[role="alert"]')).toBeVisible();
  });
});

test.describe('회원가입 페이지', () => {
  test('회원가입 폼을 렌더링한다', async ({ page }) => {
    await page.goto('/sign-up');

    await expect(page.getByLabel(/아이디/i)).toBeVisible();
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible();
    await expect(page.getByLabel(/이메일/i)).toBeVisible();
    await expect(page.getByLabel(/닉네임/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /회원가입/i })).toBeVisible();
  });

  test('로그인 링크가 존재한다', async ({ page }) => {
    await page.goto('/sign-up');

    await expect(page.getByRole('link', { name: /로그인/i })).toBeVisible();
  });
});

test.describe('라우트 가드 - 비인증 사용자', () => {
  test('비인증 사용자가 /me에 접근하면 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/me');

    await expect(page).toHaveURL(/\/login/);
  });

  test('비인증 사용자가 /posts에 접근하면 /login으로 리다이렉트된다', async ({ page }) => {
    await page.goto('/posts');

    await expect(page).toHaveURL(/\/login/);
  });
});
