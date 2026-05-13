import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from '../../../src/app.controller';
import { AppService } from '../../../src/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Root path', () => {
    it('should return root page response with correct structure', () => {
      const result = appController.rootPage();

      expect(result).toHaveProperty('name', 'Blogger Platform API');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('endpoints');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return endpoints with required keys', () => {
      const { endpoints } = appController.rootPage();

      expect(endpoints).toHaveProperty('blogs');
      expect(endpoints).toHaveProperty('posts');
      expect(endpoints).toHaveProperty('users');
    });

    it('should return valid ISO timestamp', () => {
      const { timestamp } = appController.rootPage();

      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
