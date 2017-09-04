/**
 * @fileoverview scss-lint default style formatter for sass-lint.
 * @author Dan Purdy
 */

'use strict';

const chalk = require('chalk');

module.exports = function (results) {
  let output = '';

  results.forEach(result => {

    const messages = result.messages;

    messages.forEach(lint => {
      const location = [
        chalk.cyan(result.filePath),
        chalk.magenta(lint.line),
        chalk.magenta(lint.column),
      ].join(':');

      const type = lint.severity === 2 ?
        chalk.red('[E]') :
        chalk.yellow('[W]');

      const message = `${chalk.green(lint.ruleId)}: ${lint.message}`;

      output += `${location} ${type} ${message}\n`;
    });
  });

  return output;
};
