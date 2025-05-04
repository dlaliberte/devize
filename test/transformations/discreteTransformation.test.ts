import { DiscreteTransformation } from '../../src/transformations/discreteTransformation';
import { expect } from 'chai';
import { spy } from 'sinon';

describe('Discrete Transformation', () => {
  let discreteTransformation: DiscreteTransformation;
  let transformSpy: sinon.SinonSpy;

  beforeEach(() => {
    const transformationMap = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3]
    ]);
    discreteTransformation = new DiscreteTransformation(transformationMap);
    transformSpy = spy(discreteTransformation, 'transform');
  });

  afterEach(() => {
    transformSpy.restore();
  });

  it('should perform discrete transformation', () => {
    const input = 'b';
    const output = discreteTransformation.transform(input);
    expect(transformSpy.calledOnceWith(input)).to.be.true;
    expect(output).to.equal(2);
  });

  it('should throw error for undefined transformation', () => {
    const input = 'd';
    expect(() => discreteTransformation.transform(input)).to.throw(Error);
  });
});
