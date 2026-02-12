import { TestRunner } from '../../test/test-runner.js';
import { deserializeAttribute, serializeAttribute, normalizeValue } from './property-types.js';

const runner = new TestRunner();

runner.test('deserializeAttribute: String - returns string as-is', function() {
  this.assertStrictEqual(deserializeAttribute('hello', String), 'hello');
  this.assertStrictEqual(deserializeAttribute('123', String), '123');
  this.assertStrictEqual(deserializeAttribute('', String), '');
});

runner.test('deserializeAttribute: String - returns undefined for null/undefined', function() {
  this.assertUndefined(deserializeAttribute(null, String));
  this.assertUndefined(deserializeAttribute(undefined, String));
});

runner.test('deserializeAttribute: Number - converts valid strings', function() {
  this.assertStrictEqual(deserializeAttribute('42', Number), 42);
  this.assertStrictEqual(deserializeAttribute('3.14', Number), 3.14);
  this.assertStrictEqual(deserializeAttribute('-10', Number), -10);
  this.assertStrictEqual(deserializeAttribute('0', Number), 0);
});

runner.test('deserializeAttribute: Number - handles whitespace', function() {
  this.assertUndefined(deserializeAttribute('   ', Number));
  this.assertUndefined(deserializeAttribute('', Number));
  this.assertStrictEqual(deserializeAttribute('  42  ', Number), 42);
});

runner.test('deserializeAttribute: Number - returns 0 for invalid strings', function() {
  this.assertStrictEqual(deserializeAttribute('abc', Number), 0);
  this.assertStrictEqual(deserializeAttribute('12abc', Number), 0);
});

runner.test('deserializeAttribute: Boolean - only "true" is true', function() {
  this.assertStrictEqual(deserializeAttribute('true', Boolean), true);
  this.assertStrictEqual(deserializeAttribute('false', Boolean), false);
  this.assertStrictEqual(deserializeAttribute('1', Boolean), false);
  this.assertStrictEqual(deserializeAttribute('0', Boolean), false);
  this.assertStrictEqual(deserializeAttribute('yes', Boolean), false);
  this.assertStrictEqual(deserializeAttribute('', Boolean), false);
});

runner.test('deserializeAttribute: Object - parses valid JSON', function() {
  this.assertEqual(deserializeAttribute('{"a":1}', Object), { a: 1 });
  this.assertEqual(deserializeAttribute('{}', Object), {});
});

runner.test('deserializeAttribute: Object - returns {} for invalid JSON', function() {
  this.assertEqual(deserializeAttribute('not json', Object), {});
  this.assertEqual(deserializeAttribute('{invalid}', Object), {});
});

runner.test('deserializeAttribute: Object - rejects arrays', function() {
  this.assertEqual(deserializeAttribute('[1,2,3]', Object), {});
});

runner.test('deserializeAttribute: Array - parses valid JSON arrays', function() {
  this.assertEqual(deserializeAttribute('[1,2,3]', Array), [1, 2, 3]);
  this.assertEqual(deserializeAttribute('[]', Array), []);
  this.assertEqual(deserializeAttribute('["a","b"]', Array), ['a', 'b']);
});

runner.test('deserializeAttribute: Array - returns [] for invalid JSON', function() {
  this.assertEqual(deserializeAttribute('not json', Array), []);
  this.assertEqual(deserializeAttribute('[invalid', Array), []);
});

runner.test('deserializeAttribute: Array - rejects objects', function() {
  this.assertEqual(deserializeAttribute('{"a":1}', Array), []);
});

runner.test('serializeAttribute: String - converts to string', function() {
  this.assertStrictEqual(serializeAttribute('hello', String), 'hello');
  this.assertStrictEqual(serializeAttribute(123, String), '123');
  this.assertStrictEqual(serializeAttribute(true, String), 'true');
});

runner.test('serializeAttribute: String - handles null/undefined', function() {
  this.assertStrictEqual(serializeAttribute(null, String), '');
  this.assertStrictEqual(serializeAttribute(undefined, String), '');
});

runner.test('serializeAttribute: Number - converts to string', function() {
  this.assertStrictEqual(serializeAttribute(42, Number), '42');
  this.assertStrictEqual(serializeAttribute(3.14, Number), '3.14');
  this.assertStrictEqual(serializeAttribute(0, Number), '0');
  this.assertStrictEqual(serializeAttribute(-10, Number), '-10');
});

runner.test('serializeAttribute: Boolean - converts to string', function() {
  this.assertStrictEqual(serializeAttribute(true, Boolean), 'true');
  this.assertStrictEqual(serializeAttribute(false, Boolean), 'false');
});

runner.test('serializeAttribute: Object - stringifies JSON', function() {
  this.assertStrictEqual(serializeAttribute({ a: 1 }, Object), '{"a":1}');
  this.assertStrictEqual(serializeAttribute({}, Object), '{}');
});

runner.test('serializeAttribute: Object - handles circular references', function() {
  const circular = {};
  circular.self = circular;
  this.assertStrictEqual(serializeAttribute(circular, Object), '{}');
});

runner.test('serializeAttribute: Array - stringifies JSON', function() {
  this.assertStrictEqual(serializeAttribute([1, 2, 3], Array), '[1,2,3]');
  this.assertStrictEqual(serializeAttribute([], Array), '[]');
  this.assertStrictEqual(serializeAttribute(['a', 'b'], Array), '["a","b"]');
});

runner.test('serializeAttribute: Array - handles circular references', function() {
  const circular = [];
  circular.push(circular);
  this.assertStrictEqual(serializeAttribute(circular, Array), '[]');
});

runner.test('normalizeValue: String - converts any value to string', function() {
  this.assertStrictEqual(normalizeValue(123, String), '123');
  this.assertStrictEqual(normalizeValue(true, String), 'true');
  this.assertStrictEqual(normalizeValue({ a: 1 }, String), '[object Object]');
  this.assertStrictEqual(normalizeValue([1, 2], String), '1,2');
});

runner.test('normalizeValue: Number - converts to number', function() {
  this.assertStrictEqual(normalizeValue('42', Number), 42);
  this.assertStrictEqual(normalizeValue('3.14', Number), 3.14);
  this.assertStrictEqual(normalizeValue(true, Number), 1);
  this.assertStrictEqual(normalizeValue(false, Number), 0);
});

runner.test('normalizeValue: Number - handles NaN', function() {
  this.assertTrue(Number.isNaN(normalizeValue('abc', Number)));
  this.assertTrue(Number.isNaN(normalizeValue({}, Number)));
});

runner.test('normalizeValue: Boolean - converts truthy/falsy', function() {
  this.assertStrictEqual(normalizeValue(1, Boolean), true);
  this.assertStrictEqual(normalizeValue(0, Boolean), false);
  this.assertStrictEqual(normalizeValue('hello', Boolean), true);
  this.assertStrictEqual(normalizeValue('', Boolean), false);
  this.assertStrictEqual(normalizeValue([], Boolean), true);
  this.assertStrictEqual(normalizeValue({}, Boolean), true);
  this.assertStrictEqual(normalizeValue(null, Boolean), false);
  this.assertStrictEqual(normalizeValue(undefined, Boolean), false);
});

runner.test('normalizeValue: Object - validates objects', function() {
  const obj = { a: 1 };
  this.assertEqual(normalizeValue(obj, Object), obj);
  this.assertEqual(normalizeValue({}, Object), {});
});

runner.test('normalizeValue: Object - rejects non-objects', function() {
  this.assertEqual(normalizeValue('string', Object), {});
  this.assertEqual(normalizeValue(123, Object), {});
  this.assertEqual(normalizeValue([1, 2], Object), {});
  this.assertEqual(normalizeValue(null, Object), {});
  this.assertEqual(normalizeValue(undefined, Object), {});
});

runner.test('normalizeValue: Array - validates arrays', function() {
  const arr = [1, 2, 3];
  this.assertEqual(normalizeValue(arr, Array), arr);
  this.assertEqual(normalizeValue([], Array), []);
});

runner.test('normalizeValue: Array - rejects non-arrays', function() {
  this.assertEqual(normalizeValue('string', Array), []);
  this.assertEqual(normalizeValue(123, Array), []);
  this.assertEqual(normalizeValue({ a: 1 }, Array), []);
  this.assertEqual(normalizeValue(null, Array), []);
  this.assertEqual(normalizeValue(undefined, Array), []);
});

runner.test('Round-trip: String stays consistent', function() {
  const original = 'hello';
  const serialized = serializeAttribute(original, String);
  const deserialized = deserializeAttribute(serialized, String);
  this.assertStrictEqual(deserialized, original);
});

runner.test('Round-trip: Number stays consistent', function() {
  const original = 42;
  const serialized = serializeAttribute(original, Number);
  const deserialized = deserializeAttribute(serialized, Number);
  this.assertStrictEqual(deserialized, original);
});

runner.test('Round-trip: Boolean stays consistent', function() {
  this.assertStrictEqual(
    deserializeAttribute(serializeAttribute(true, Boolean), Boolean), true
  );
  this.assertStrictEqual(
    deserializeAttribute(serializeAttribute(false, Boolean), Boolean), false
  );
});

runner.test('Round-trip: Object stays consistent', function() {
  const original = { a: 1, b: 'test' };
  const serialized = serializeAttribute(original, Object);
  const deserialized = deserializeAttribute(serialized, Object);
  this.assertEqual(deserialized, original);
});

runner.test('Round-trip: Array stays consistent', function() {
  const original = [1, 'test', true];
  const serialized = serializeAttribute(original, Array);
  const deserialized = deserializeAttribute(serialized, Array);
  this.assertEqual(deserialized, original);
});

runner.test('Round-trip: normalize → serialize → deserialize', function() {
  const boolResult = deserializeAttribute(
    serializeAttribute(normalizeValue(1, Boolean), Boolean), Boolean
  );
  this.assertStrictEqual(boolResult, true);

  const numResult = deserializeAttribute(
    serializeAttribute(normalizeValue('42', Number), Number), Number
  );
  this.assertStrictEqual(numResult, 42);
});

runner.run().catch(() => process.exit(1));
