export class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assertEqual(actual, expected) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);

    if (actualStr !== expectedStr) {
      throw new Error(`Expected: ${expectedStr}\n  Actual: ${actualStr}`);
    }
  }

  assertStrictEqual(actual, expected) {
    if (actual !== expected) {
      throw new Error(`Expected: ${expected} (${typeof expected})\n  Actual: ${actual} (${typeof actual})`);
    }
  }

  assertTrue(value) {
    if (value !== true) {
      throw new Error(`Expected: true\n  Actual: ${value}`);
    }
  }

  assertUndefined(value) {
    if (value !== undefined) {
      throw new Error(`Expected: undefined\n  Actual: ${value}`);
    }
  }

  async run() {
    console.log('\n🧪 Running tests...\n');

    for (const { name, fn } of this.tests) {
      try {
        await fn.call(this);
        this.passed++;
        console.log(`  ✅ ${name}`);
      } catch (error) {
        this.failed++;
        console.error(`  ❌ ${name}`);
        console.error(`     ${error.message}\n`);
      }
    }

    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);

    if (this.failed > 0) {
      throw new Error('Tests failed');
    }
  }
}
