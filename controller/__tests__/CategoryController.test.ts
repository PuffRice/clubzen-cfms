import { CategoryController } from '../CategoryController';

describe('CategoryController', () => {
  const ctrl = new CategoryController();

  it('getCategories returns default categories', async () => {
    const res = await ctrl.getCategories();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('createCategory validates input and returns 400 when missing fields', async () => {
    const res = await ctrl.createCategory({ body: { name: 'OnlyName' } });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('createCategory returns 201 with created category', async () => {
    const payload = { name: 'New Cat', type: 'Expense', parentId: '1' };
    const res = await ctrl.createCategory({ body: payload });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ id: 'new-category-id', name: 'New Cat', type: 'Expense', parentId: '1' });
  });

  it('updateCategory validates id and name', async () => {
    const res = await ctrl.updateCategory({ params: {}, body: {} });
    expect(res.statusCode).toBe(400);
  });

  it('updateCategory returns 200 on success', async () => {
    const res = await ctrl.updateCategory({ params: { id: '1' }, body: { name: 'Updated' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('deleteCategory validates id and returns 200 on success', async () => {
    const bad = await ctrl.deleteCategory({ params: {} });
    expect(bad.statusCode).toBe(400);

    const ok = await ctrl.deleteCategory({ params: { id: '1' } });
    expect(ok.statusCode).toBe(200);
  });
});
