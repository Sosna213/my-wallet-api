import helmet from 'helmet';
import * as nocache from 'nocache';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as fs from "fs";

function checkEnvironment(configService: ConfigService) {
  const requiredEnvVars = [
    'PORT',
    'ISSUER_BASE_URL',
    'AUDIENCE',
    'CLIENT_ORIGIN_URL',
  ];

  requiredEnvVars.forEach((envVar) => {
    if (!configService.get<string>(envVar)) {
      throw Error(`Undefined environment variable: ${envVar}`);
    }
  });
}

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/cert.key'),
    cert: fs.readFileSync('./secrets/cert.crt'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });

  const config = new DocumentBuilder()
      .setTitle('My wallet')
      .setDescription('The My Wallet API provides a comprehensive set of endpoints for managing and displaying personal financial statistics. This API enables users to seamlessly interact with their financial data, empowering them to track, analyze, and visualize their finances.')
      .setVersion('1.0')
      .addTag('user')
      .addTag('account')
      .addTag('transaction')
      .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get<ConfigService>(ConfigService);
  checkEnvironment(configService);

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(nocache());

  app.enableCors({
    origin: configService.get<string>('CLIENT_ORIGIN_URL'),
    methods: ['GET', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  });

  app.use(
      helmet({
        hsts: { maxAge: 31536000 },
        frameguard: { action: 'deny' },
        contentSecurityPolicy: {
          directives: {
            'default-src': ["'self'"],
            'frame-ancestors': ["'none'"],
          },
        },
      }),
  );

  await app.listen(configService.get<string>('PORT'));
}

bootstrap();
