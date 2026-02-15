import * as dotenv from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../../../.env.test');

const loadResult = dotenv.config({ path: envPath });

if (loadResult.error) {
  throw new Error(
    `integration test requires .env.test file at ${envPath}. Please create it and set DATABASE_URL to a test database.`,
  );
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in .env.test');
}

let databaseName: string;

try {
  const parsedUrl = new URL(databaseUrl);
  databaseName = parsedUrl.pathname.split('/').at(-1) ?? '';
} catch {
  throw new Error('DATABASE_URL in .env.test is invalid and cannot be parsed');
}

if (
  !databaseName ||
  !/([_.-]test([_.-]|$)|(^|[_.-])test$)/i.test(databaseName)
) {
  throw new Error(
    'DATABASE_URL for integration tests must point to a test database (for example, containing "_test" in database name).',
  );
}
