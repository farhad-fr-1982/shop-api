import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './exceptions/http.exception';
import { GlobalExceptionFilter } from './exceptions/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // اعتبارسنجی سراسری
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // فعال کردن CORS (برای اتصال از前端 دیگر)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter)
  app.useGlobalFilters(new GlobalExceptionFilter)

  // تنظیم پیشوند سراسری (اختیاری)
  // app.setGlobalPrefix('api');

  // تنظیم Swagger
  const config = new DocumentBuilder()
    .setTitle('داکیومنت و مستندات فروشگاه آنلاین')
    .setDescription('مستندات تفصیلی کار با API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // تغییر به api-docs برای جلوگیری از تداخل

  // شروع سرور
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}

bootstrap();