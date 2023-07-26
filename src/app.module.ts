import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UserModule} from './user/user.module';
import {TypeOrmModule} from "@nestjs/typeorm";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('POSTGRES_HOST', 'localhost'),
                port: configService.get<number>('POSTGRES_PORT', 5432),
                username: configService.get('POSTGRES_USER', 'postgres'),
                password: configService.get('POSTGRES_PASSWORD', '1234'),
                database: configService.get('POSTGRES_DATABASE', 'my_wallet_db'),
                synchronize: true,
                autoLoadEntities: true,
            }),
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
