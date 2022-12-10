import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

import * as morgan from 'morgan';
import helmet from 'helmet';

import { AppModule } from '@src/modules';
import { EEnvKeys } from './enums/env.enum';


async function bootstrap() {
  // Instanciate the app
  const app = await NestFactory.create(AppModule);

  // Enable helmet, see https://helmetjs.github.io/
  app.use(helmet());

  // Enable morgan, see https://expressjs.com/en/resources/middleware/morgan.html
  app.use(morgan('combined'));

  // Enable cors, see https://docs.nestjs.com/security/cors + https://github.com/expressjs/cors#configuration-options
  app.enableCors({
    origin: '*',
    methods: 'GET, POST',
    allowedHeaders: 'Access-Control-Allow-Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
  });

  // structure a base document that conforms to the OpenAPI Specification
  const configService = app.get(ConfigService);

  // define swagger config"
  const config = new DocumentBuilder()
    .setTitle('sleepn api swagger')
    .setDescription('sleepn core api')
    .setVersion('1.0')
    .build();

  // Get a serializable object conforming to OpenAPI Document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  
  // Expose the app
  await app.listen(String(configService.get<string>(EEnvKeys.PORT)));
  const logger = new Logger('Bootstrap');
  logger.debug('Sleepn API is listening on port 3000');        
}

bootstrap();


