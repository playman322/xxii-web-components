import { TestRunner } from '../../test/test-runner.js';
import { isNil } from './helpers.js';

const runner = new TestRunner();

runner.test('isNil: returns true for null', function() {
  this.assertTrue(isNil(null));
});

runner.test('isNil: returns true for undefined', function() {
  this.assertTrue(isNil(undefined));
});

runner.test('isNil: returns false for 0', function() {
  this.assertStrictEqual(isNil(0), false);
});

runner.test('isNil: returns false for empty string', function() {
  this.assertStrictEqual(isNil(''), false);
});

runner.test('isNil: returns false for false', function() {
  this.assertStrictEqual(isNil(false), false);
});

runner.test('isNil: returns false for NaN', function() {
  this.assertStrictEqual(isNil(NaN), false);
});

runner.test('isNil: returns false for objects', function() {
  this.assertStrictEqual(isNil({}), false);
  this.assertStrictEqual(isNil([]), false);
});

runner.test('isNil: returns false for truthy values', function() {
  this.assertStrictEqual(isNil('hello'), false);
  this.assertStrictEqual(isNil(42), false);
  this.assertStrictEqual(isNil(true), false);
});

runner.run().catch(() => process.exit(1));
