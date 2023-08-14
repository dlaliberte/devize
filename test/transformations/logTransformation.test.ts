import { LogTransformation } from '../../src/transformations/logTransformation';
import { expect } from 'chai';
import { stub } from 'sinon';
import { Page } from 'playwright';

describe('LogTransformation', () => {
  let logTransformation: LogTransformation;
  let page: Page;

  beforeEach(() => {
    logTransformation = new LogTransformation();
    page = stub() as unknown as Page;
  });

  afterEach(() => {
    logTransformation = null;
    page = null;
  });

  it('should correctly apply log transformation', async () => {
    const data = [1, 2, 3, 4, 5];
    const expected = [0, 0.6931471805599453, 1.0986122886681098, 1.3862943611198906, 1.6094379124341003];

    const result = await logTransformation.transform(data, page);

    expect(result).to.deep.equal(expected);
  });

  it('should throw error for negative values', async () => {
    const data = [-1, 2, 3, 4, 5];

    try {
      await logTransformation.transform(data, page);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Log transformation is not defined for negative values');
    }
  });
});