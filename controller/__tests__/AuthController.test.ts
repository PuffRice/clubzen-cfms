import { AuthController } from '../AuthController';

describe('AuthController', () => {
  const controller = new AuthController();

  it('returns 400 when email or password missing', async () => {
    const res = await controller.login({ body: {} });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required');
  });

  it('returns 200 and token for valid credentials', async () => {
    const res = await controller.login({ body: { email: 'a@b.com', password: 'pass' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ token: expect.any(String), userId: 'user-001', role: 'ADMIN' });
  });
});
