/**
 * @fileoverview Tests for sass-lint-format-scss-lint.
 * @author Dan Purdy
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require('chai').assert,
    chalk = require('chalk'),
    proxyquire = require('proxyquire'),
    sinon = require('sinon');

// Chalk protects its methods so we need to inherit from it for Sinon to work.
const chalkStub = Object.create(chalk, {
  yellow: {
    value (str) {
      return chalk.yellow(str);
    },
    writable: true
  },
  red: {
    value (str) {
      return chalk.red(str);
    },
    writable: true
  },
  green: {
    value (str) {
      return chalk.green(str);
    },
    writable: true
  },
  magenta: {
    value (str) {
      return chalk.magenta(str);
    },
    writable: true
  },
  cyan: {
    value (str) {
      return chalk.magenta(str);
    },
    writable: true
  },
});

const formatter = proxyquire('../index', { chalk: chalkStub });

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('formatter:scss-lint', () => {
  let sandbox;
  const colorsEnabled = chalk.enabled;

  beforeEach(() => {
    chalk.enabled = false;
    sandbox = sinon.sandbox.create();
    sandbox.spy(chalkStub, 'yellow');
    sandbox.spy(chalkStub, 'red');
    sandbox.spy(chalkStub, 'green');
    sandbox.spy(chalkStub, 'magenta');
    sandbox.spy(chalkStub, 'cyan');
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
    chalk.enabled = colorsEnabled;
  });

  describe('when passed no messages', () => {
    const code = [{
      filePath: 'foo.scss',
      messages: []
    }];

    it('should return nothing', () => {
      const result = formatter(code);

      assert.equal(result, '');
      assert.equal(chalkStub.cyan.callCount, 0);
      assert.equal(chalkStub.magenta.callCount, 0);
      assert.equal(chalkStub.red.callCount, 0);
      assert.equal(chalkStub.yellow.callCount, 0);
      assert.equal(chalkStub.green.callCount, 0);
    });
  });

  describe('when passed a single message', () => {
    const code = [{
      filePath: 'foo.scss',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        line: 5,
        column: 10,
        ruleId: 'foo'
      }]
    }];

    it('should return a string in the format filename:line:column [severity] ruleId:message', () => {
      const result = formatter(code);

      assert.equal(result, 'foo.scss:5:10 [E] foo: Unexpected foo.\n');
      assert.equal(chalkStub.cyan.callCount, 1);
      assert.equal(chalkStub.magenta.callCount, 2);
      assert.equal(chalkStub.red.callCount, 1);
      assert.equal(chalkStub.yellow.callCount, 0);
      assert.equal(chalkStub.green.callCount, 1);
    });

    it('should return a string in the format filename:line:column: warning [warning/rule_id]', () => {
      code[0].messages[0].severity = 1;
      const result = formatter(code);

      assert.equal(result, 'foo.scss:5:10 [W] foo: Unexpected foo.\n');
      assert.equal(chalkStub.cyan.callCount, 1);
      assert.equal(chalkStub.magenta.callCount, 2);
      assert.equal(chalkStub.red.callCount, 0);
      assert.equal(chalkStub.yellow.callCount, 1);
      assert.equal(chalkStub.green.callCount, 1);
    });
  });

  describe('when passed multiple messages', () => {
    const code = [{
      filePath: 'foo.scss',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        line: 5,
        column: 10,
        ruleId: 'foo'
      }, {
        message: 'Unexpected bar.',
        severity: 1,
        line: 6,
        column: 11,
        ruleId: 'bar'
      }]
    }];

    it('should return a string with multiple entries', () => {
      const result = formatter(code);

      assert.equal(result, 'foo.scss:5:10 [E] foo: Unexpected foo.\nfoo.scss:6:11 [W] bar: Unexpected bar.\n');
      assert.equal(chalkStub.cyan.callCount, 2);
      assert.equal(chalkStub.magenta.callCount, 4);
      assert.equal(chalkStub.red.callCount, 1);
      assert.equal(chalkStub.yellow.callCount, 1);
      assert.equal(chalkStub.green.callCount, 2);
    });
  });

  describe('when passed multiple files with 1 message each', () => {
    const code = [{
      filePath: 'foo.scss',
      messages: [{
        message: 'Unexpected foo.',
        severity: 2,
        line: 5,
        column: 10,
        ruleId: 'foo'
      }]
    }, {
      filePath: 'bar.scss',
      messages: [{
        message: 'Unexpected bar.',
        severity: 1,
        line: 6,
        column: 11,
        ruleId: 'bar'
      }]
    }];

    it('should return a string with multiple entries', () => {
      const result = formatter(code);

      assert.equal(result, 'foo.scss:5:10 [E] foo: Unexpected foo.\nbar.scss:6:11 [W] bar: Unexpected bar.\n');
      assert.equal(chalkStub.cyan.callCount, 2);
      assert.equal(chalkStub.magenta.callCount, 4);
      assert.equal(chalkStub.red.callCount, 1);
      assert.equal(chalkStub.yellow.callCount, 1);
      assert.equal(chalkStub.green.callCount, 2);
    });
  });
});
