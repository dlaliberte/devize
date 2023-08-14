import { test, expect } from '@playwright/test';
import { DiscreteTransformation } from '../../src/transformations/discreteTransformation';
import sinon from 'sinon';

test.describe('Discrete Transformation', () => {
  let discreteTransformation: DiscreteTransformation;
  let transformSpy: sinon.SinonSpy;

  test.beforeEach(() => {
    discreteTransformation = new DiscreteTransformation();
    transformSpy = sinon.spy(discreteTransformation, 'transform');
  });

  test.afterEach(() => {
    transformSpy.restore();
  });

  test('should perform discrete transformation', async () => {
    const input = { value: 5 };
    const output = discreteTransformation.transform(input);
    expect(transformSpy.calledOnceWith(input)).toBe(true);
    expect(output).toEqual({ value: 5 });
  });
});