const request = require('supertest');
const app = require('./index');

describe('Survey API', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api/surveys', () => {
    it('should return surveys array', async () => {
      const response = await request(app).get('/api/surveys');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('surveys');
      expect(Array.isArray(response.body.surveys)).toBe(true);
    });
  });

  describe('POST /api/surveys', () => {
    it('should create a new survey', async () => {
      const survey = { title: 'Test Survey', description: 'Test Description' };
      const response = await request(app).post('/api/surveys').send(survey);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(survey.title);
    });
  });

  describe('GET /', () => {
    it('should serve the index.html', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });
});
