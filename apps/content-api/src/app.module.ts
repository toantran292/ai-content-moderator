import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { ModerationsController } from './moderations/moderations.controller';
import { RedisModule } from './redis/redis.module';
import { JobsModule } from './jobs/jobs.module';
import ormconfig from 'ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormconfig.options,
        autoLoadEntities: true,
      }),
    }),
    RedisModule, 
    JobsModule
  ],
  controllers: [AppController, HealthController, ModerationsController],
  providers: [AppService],
})
export class AppModule {}
