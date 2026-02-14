import * as common from '../CommonController';

describe('CommonController (types-only)', () => {
  it('has no runtime exports', () => {
    expect(Object.keys(common).length).toBe(0);
  });
});
