/**
 * @file Tree-sitter parser for mirth
 * @author amatgil <amatgilvinyes@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "mirth",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => $.repeat($.definicio),

    module_declaration: $ => $.seq('module', $.ascii_alphanum, '.', $.ascii_alphanum),
    import_statement: $ => $.seq('import', $.ascii_alphanum, '.', $.ascii_alphanum),

    function_definintion: $ => seq(
      $.optional('inline'),
      'def',
      $.identifier,
      optional(seq(
        '(',
        $.identifier, $.some($.seq(',', $.identifier)),
        ')'
      )), // generics
      optional($.parameter_list),
      $.block // 'body' maybe?
    ),

    parameter_list: $ => $.seq(
      '[',
      $.repeat($.identifier), $.optional("|-"), // held back
      $.repeat($.identifier), $.optional("--"), repeat($.identifier),
      ']',
    ),

    block: $ => $.seq( '{', $.repeat($.expression), '}' ),

    expression: $ => choice(
      $.identifier,
      $.number
    ),

    number: $ => $.seq(/\d+/, $.optional($.token.immediate('u'))),

    // "i.e. the ascii letters, digits, and symbols" excluding ,()[]{}\`."
    // ^ from the vim extension
    // (this is so ass but I don't actually know how to write regex-es)
    identifier: $ => /([a-z]|[A-Z]|[0-9]|!|"|#|\$|%|&|´|\*|\+|-|\.|\/|:|;|<|=|>|\?|@|\^|_|\||~)+/,

    // I made this one up tremendously based on other langs' I know (e.g. rust)
    ascii_alphanum: $ => /([a-z]|[A-Z]|_)([a-z]|[A-Z]|[0-9]|_)*/
  }
});
