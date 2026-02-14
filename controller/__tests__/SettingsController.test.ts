import { SettingsController } from '../SettingsController';

describe('SettingsController', () => {
  const ctrl = new SettingsController();

  it('updateSettings returns 400 when body missing', async () => {
    const res = await ctrl.updateSettings({ body: undefined });
    expect(res.statusCode).toBe(400);
  });

  it('updateSettings returns 200 when body provided', async () => {
    const res = await ctrl.updateSettings({ body: { theme: 'dark' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Settings updated successfully');
  });
});
