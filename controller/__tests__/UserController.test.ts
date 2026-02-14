import { UserController } from '../UserController';

describe('UserController', () => {
  const ctrl = new UserController();

  it('changePassword validates input', async () => {
    const bad = await ctrl.changePassword({ body: { currentPassword: 'a' } });
    expect(bad.statusCode).toBe(400);

    const ok = await ctrl.changePassword({ body: { currentPassword: 'a', newPassword: 'b' } });
    expect(ok.statusCode).toBe(200);
  });

  it('getProfile returns user profile', async () => {
    const res = await ctrl.getProfile();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ userId: 'user-001', name: 'Demo User' });
  });
});
