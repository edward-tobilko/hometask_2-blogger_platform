import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';

export const deleteAllData = async (app: INestApplication) => {
  return request(app.getHttpServer() as Server)
    .delete('/api/testing/all-data')
    .expect(HttpStatus.NO_CONTENT);
};
