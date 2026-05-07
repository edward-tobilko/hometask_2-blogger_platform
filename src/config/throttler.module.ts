import { ThrottlerModule } from '@nestjs/throttler';

export const throttlerModule = ThrottlerModule.forRoot({
  throttlers: [
    {
      ttl: 10000,
      limit: 5,
    },
  ],
});
