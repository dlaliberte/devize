import { LinearTransformation } from '../../src/transformations/linearTransformation';
import { expect } from 'chai';
import { spy } from 'sinon';

describe('Linear Transformation', () => {
  let linearTransformation: LinearTransformation;
  let transformSpy: sinon.SinonSpy;

  beforeEach(() => {
    linearTransformation = new LinearTransformation(2, 3); // slope = 2, intercept = 3
    transformSpy = spy(linearTransformation, 'transform');
  });

  afterEach(() => {
    transformSpy.restore();
  });

  it('should perform linear transformation', () => {
    const input = 5;
    const output = linearTransformation.transform(input);
    expect(transformSpy.calledOnceWith(input)).to.be.true;
    expect(output).to.equal(13); // 2 * 5 + 3 = 13
  });

  it('should handle zero input', () => {
    const input = 0;
    const output = linearTransformation.transform(input);
    expect(output).to.equal(3); // 2 * 0 + 3 = 3
  });

  it('should handle negative input', () => {
    const input = -5;
    const output = linearTransformation.transform(input);
    expect(output).to.equal(-7); // 2 * (-5) + 3 = -7
  });
});
