import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { ModerationsController } from './moderations/moderations.controller';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [AppController, HealthController, ModerationsController],
  providers: [AppService],
})
export class AppModule {}
