import { LogTransformation } from '../../src/transformations/logTransformation';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('LogTransformation', () => {
  let logTransformation: LogTransformation;

  beforeEach(() => {
    logTransformation = new LogTransformation();
  });

  afterEach(() => {
    logTransformation = null;
  });

  it('should correctly apply log transformation', () => {
    // Test with individual values
    expect(logTransformation.transform(1)).to.be.closeTo(0, 0.0001);
    expect(logTransformation.transform(2)).to.be.closeTo(0.6931, 0.0001);
    expect(logTransformation.transform(3)).to.be.closeTo(1.0986, 0.0001);
    expect(logTransformation.transform(4)).to.be.closeTo(1.3863, 0.0001);
    expect(logTransformation.transform(5)).to.be.closeTo(1.6094, 0.0001);
  });

  it('should throw error for negative values', () => {
    expect(() => logTransformation.transform(-1)).to.throw();
  });
});
