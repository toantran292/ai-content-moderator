import { Test, TestingModule } from '@nestjs/testing';
import { ModerationsController } from './moderations.controller';

describe('ModerationsController', () => {
  let controller: ModerationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationsController],
    }).compile();

    controller = module.get<ModerationsController>(ModerationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
