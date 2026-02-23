import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolveCorsOrigin, resolveTrustProxy } from './main.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const trustProxyHops = resolveTrustProxy(process.env);
  if (trustProxyHops !== null) {
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance() as {
      set?: (...args: unknown[]) => void;
    };
    instance.set?.('trust proxy', trustProxyHops);
  }

  app.enableCors({
    origin: resolveCorsOrigin(process.env),
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
