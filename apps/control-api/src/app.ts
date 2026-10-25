import 'reflect-metadata';
import { applicationIds } from '@cyrantis/core/contracts';
import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

export const applicationId = applicationIds.control;

export async function createApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { logger: false, bodyParser: false });
  const express = app.getHttpAdapter().getInstance() as {
    disable(name: string): void;
    set(name: string, value: boolean): void;
  };
  express.disable('x-powered-by');
  express.set('trust proxy', false);
  return app;
}
