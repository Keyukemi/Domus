import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testUser = {
    email: 'e2e-test@domus.com',
    password: 'Test1234',
    name: 'E2E Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same ValidationPipe as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  // Clean up test user before and after all tests
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should reject invalid data with 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad', password: 'short' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email must be an email');
    });

    it('should register a new user with 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        email: testUser.email,
        name: testUser.name,
        role: 'MEMBER',
        householdId: null,
      });
      expect(response.body.id).toBeDefined();
      // Password must never be returned
      expect(response.body.password).toBeUndefined();
    });

    it('should reject duplicate email with 409', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject wrong password with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass1' });

      expect(response.status).toBe(401);
    });

    it('should reject non-existent email with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@domus.com', password: 'Test1234' });

      expect(response.status).toBe(401);
    });

    it('should login and return JWT with 200', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toMatchObject({
        email: testUser.email,
        name: testUser.name,
        role: 'MEMBER',
      });
      // Password must never be returned
      expect(response.body.user.password).toBeUndefined();
    });
  });
});
