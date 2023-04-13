import {forwardRef, Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import * as process from "process";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientProxyFactory, Transport} from "@nestjs/microservices";
import {RolesModule} from "../roles/roles.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService,
      {
          provide: 'PROFILE_SERVICE',
          useFactory: (configService: ConfigService) => {
              const user = configService.get('RABBITMQ_USER');
              const password = configService.get('RABBITMQ_PASSWORD');
              const host = configService.get('RABBITMQ_HOST');
              const queueName = configService.get('RABBITMQ_QUEUE_NAME_USER_PROFILE');

              return ClientProxyFactory.create({
                  transport: Transport.RMQ,
                  options: {
                      urls: [`amqp://${user}:${password}@${host}`],
                      queue: queueName,
                      queueOptions: {
                          durable: true,
                      },
                  },
              })
          },
          inject: [ConfigService],
      }],
  imports: [
      // предотвращаем кольцевую зависимость
      forwardRef( () => UsersModule),
      forwardRef( () => RolesModule),
      ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`
      }),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || "SECRET",
        signOptions: {
          expiresIn: '24h'
        }
      })
  ],
    exports: [
        AuthModule,
        AuthService,
        JwtModule
    ]
})
export class AuthModule {}
