import { test, expect } from '@playwright/test';
import sinon from 'sinon';
import { LinearTransformation } from '../../src/transformations/linearTransformation';

test.describe('Linear Transformation', () => {
  let linearTransformation: LinearTransformation;
  let transformStub: sinon.SinonStub;

  test.beforeEach(() => {
    linearTransformation = new LinearTransformation();
    transformStub = sinon.stub(linearTransformation, 'transform');
  });

  test.afterEach(() => {
    transformStub.restore();
  });

  test('should correctly transform data', async () => {
    const inputData = { x: 2 };
    const expectedOutput = { x: 4 };

    transformStub.withArgs(inputData).returns(expectedOutput);

    const result = linearTransformation.transform(inputData);

    expect(result).toEqual(expectedOutput);
    sinon.assert.calledOnceWithExactly(transformStub, inputData);
  });
});