import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import * as process from "process";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const user = configService.get('RABBITMQ_USER');
    const password = configService.get('RABBITMQ_PASSWORD');
    const host = configService.get('RABBITMQ_HOST');
    const queueName = configService.get('RABBITMQ_QUEUE_NAME_USER_PROFILE');

    const microservice = app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [`amqp://${user}:${password}@${host}`],
            queue: queueName,
            queueOptions: {
                durable: true
            },
        },
    });

    const config = new DocumentBuilder()
        .setTitle("First NestJS project")
        .setDescription("Документация REST API проекта")
        .setVersion("0.0.1")
        .addTag("KSP")
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('/api/docs', app, document)

    // Доступ по токену для всех запросов
    // app.useGlobalGuards(JwtAuthGuard)

    // глобальное использование пайпов для всех запросов
    // app.useGlobalPipes(new ValidationPipe())

    await app.startAllMicroservices();
    await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}

bootstrap();
