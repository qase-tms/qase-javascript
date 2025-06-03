import { expect } from 'chai';
import { generateSignature } from '../src/utils/signature';

describe('generateSignature', () => {
  it('should generate signature with all parameters', () => {
    const result = generateSignature(
      [1, 2, 3],
      ['Suite1', 'Suite2'],
      { Param1: 'Value1', Param2: 'Value2' }
    );
    expect(result).to.equal("1-2-3::suite1::suite2::{'param1':'value1'}::{'param2':'value2'}");
  });

  it('should process suite values correctly', () => {
    const result = generateSignature(
      null,
      ['  Suite With Spaces  ', 'Suite\tWith\tTabs'],
      {}
    );
    expect(result).to.equal("suite_with_spaces::suite::with::tabs");
  });

  it('should handle complex suite names', () => {
    const result = generateSignature(
      null,
      ['test/fields.spec.js::Example: Fields.spec.js\tTest Cases With Field: Layer::Layer = Unit'],
      {}
    );
    expect(result).to.equal("test/fields.spec.js::example:_fields.spec.js::test_cases_with_field:_layer::layer_=_unit");
  });

  it('should generate signature with null testopsIds', () => {
    const result = generateSignature(
      null,
      ['suite1', 'suite2'],
      { param1: 'value1' }
    );
    expect(result).to.equal("suite1::suite2::{'param1':'value1'}");
  });

  it('should generate signature with empty testopsIds array', () => {
    const result = generateSignature(
      [],
      ['suite1', 'suite2'],
      { param1: 'value1' }
    );
    expect(result).to.equal("suite1::suite2::{'param1':'value1'}");
  });

  it('should generate signature with empty suites array', () => {
    const result = generateSignature(
      [1, 2, 3],
      [],
      { param1: 'value1' }
    );
    expect(result).to.equal("1-2-3::{'param1':'value1'}");
  });

  it('should generate signature with empty parameters', () => {
    const result = generateSignature(
      [1, 2, 3],
      ['suite1'],
      {}
    );
    expect(result).to.equal("1-2-3::suite1");
  });

  it('should generate signature with only testopsIds', () => {
    const result = generateSignature(
      [1, 2, 3],
      [],
      {}
    );
    expect(result).to.equal("1-2-3");
  });

  it('should generate signature with only suites', () => {
    const result = generateSignature(
      null,
      ['suite1', 'suite2'],
      {}
    );
    expect(result).to.equal("suite1::suite2");
  });

  it('should generate signature with only parameters', () => {
    const result = generateSignature(
      null,
      [],
      { param1: 'value1', param2: 'value2' }
    );
    expect(result).to.equal("{'param1':'value1'}::{'param2':'value2'}");
  });

  it('should generate empty signature when all inputs are empty', () => {
    const result = generateSignature(
      null,
      [],
      {}
    );
    expect(result).to.equal("");
  });
}); 
