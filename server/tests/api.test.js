const request = require('supertest');
const app = require('../src/app');
const Event = require('../src/models/Event');

describe('Event Management Platform - Public Discovery & Authenticated Mutation Tests', () => {
  beforeAll(() => {
    // Mock Event queries to avoid buffering timeouts when running offline without an active MongoDB service
    jest.spyOn(Event, 'find').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([
        {
          _id: '65f123456789012345678901',
          title: 'Sample Summit',
          summary: 'Sample summary for discovery',
          category: 'Technology',
          format: 'online',
          startDate: new Date(),
          isActive: true,
          status: 'published',
          bookings: [],
        },
      ]),
    });

    jest.spyOn(Event, 'countDocuments').mockResolvedValue(1);

    jest.spyOn(Event, 'findById').mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: '65f123456789012345678901',
          title: 'Sample Summit',
          summary: 'Sample summary',
          description: 'Detailed description for test',
          category: 'Technology',
          format: 'online',
          isActive: true,
          status: 'published',
          bookings: [],
          toObject: () => ({
            _id: '65f123456789012345678901',
            title: 'Sample Summit',
            isActive: true,
            status: 'published',
            bookings: [],
          }),
        }),
      }),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('GET /api/health should return 200 OK with status message', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('running smoothly');
    });
  });

  describe('Public Discovery Endpoints (Accessible to all users without login)', () => {
    it('GET /api/events should be accessible to unauthenticated guests and return 200 OK', async () => {
      const res = await request(app).get('/api/events');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/events/:id should be accessible to unauthenticated guests and return 200 OK', async () => {
      const res = await request(app).get('/api/events/65f123456789012345678901');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Sample Summit');
    });
  });

  describe('Authentication Enforcement on Sensitive & Mutation APIs', () => {
    it('POST /api/events/:id/book must reject unauthenticated booking requests with 401', async () => {
      const res = await request(app).post('/api/events/65f123456789012345678901/book');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('POST /api/events must reject unauthenticated creation requests with 401', async () => {
      const res = await request(app).post('/api/events').send({
        title: 'Unauthorized Event',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('PUT /api/events/:id must reject unauthenticated update requests with 401', async () => {
      const res = await request(app).put('/api/events/65f123456789012345678901').send({
        title: 'Update Attempt',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('DELETE /api/events/:id must reject unauthenticated delete requests with 401', async () => {
      const res = await request(app).delete('/api/events/65f123456789012345678901');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('PATCH /api/events/:id/status must reject unauthenticated toggle requests with 401', async () => {
      const res = await request(app).patch('/api/events/65f123456789012345678901/status');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });
  });

  describe('Validation & Security Middleware Tests', () => {
    it('POST /api/auth/register should fail with 400 when missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      // New validateMiddleware returns a human-readable summary message
      expect(res.body.message).toContain('Validation failed');
      // errors is now a field → message object map (not an array)
      expect(res.body.errors).toBeDefined();
      expect(typeof res.body.errors).toBe('object');
      // 'name' and 'password' should be missing; 'email' should be invalid
      expect(res.body.errors).toHaveProperty('name');
      expect(res.body.errors).toHaveProperty('password');
    });

    it('POST /api/auth/login should fail with 400 when email is invalid', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'invalid-email-format',
        password: '',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /non-existent-route should return 404 with structured JSON envelope', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Resource not found');
    });

    it('Security: Error responses must NEVER expose database credentials or stack traces', async () => {
      const res = await request(app).get('/api/events/invalid-cast-id');
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toMatch(/mongodb(?:\+srv)?:\/\//i);
      expect(bodyStr).not.toMatch(/password/i);
      expect(res.body.stack).toBeUndefined();
    });
  });
});
