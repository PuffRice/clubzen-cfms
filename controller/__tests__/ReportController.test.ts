import { ReportController } from '../ReportController';

describe('ReportController', () => {
  const ctrl = new ReportController();

  it('getDailySummary returns 400 when date missing', async () => {
    const res = await ctrl.getDailySummary({ query: {} });
    expect(res.statusCode).toBe(400);
  });

  it('getDailySummary returns 200 and summary when date provided', async () => {
    const res = await ctrl.getDailySummary({ query: { date: '2026-02-14' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalIncome');
    expect(res.body).toHaveProperty('totalExpense');
  });

  it('getMonthlySummary validates month/year and returns data', async () => {
    const bad = await ctrl.getMonthlySummary({ query: { month: '02' } });
    expect(bad.statusCode).toBe(400);

    const ok = await ctrl.getMonthlySummary({ query: { month: '02', year: '2026' } });
    expect(ok.statusCode).toBe(200);
    expect(ok.body).toHaveProperty('balance');
  });

  it('exportReport returns success with PDF format', async () => {
    const res = await ctrl.exportReport();
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ format: 'PDF' });
  });
});
