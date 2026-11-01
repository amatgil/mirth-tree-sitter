/**
 * @file Tree-sitter parser for mirth
 * @author amatgil <amatgilvinyes@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "mirth",

  word: $ => $.identifier, // took me a while to understand: TS will find all literals in this grammar
                           // matching this, and treat them as keywords instead of bare identifiers

  extras: ($) => [
    /\s/, // whitespace
    $.comment,
  ],

  rules: {
    source_file: $ => seq(
      optional($.module_declaration), // not really optional but for parsing, yeah
      repeat($.def)
    ),
    comment: $ => token(seq(
      choice("#","|||"),
      token.immediate(/.*/)  // stolen from rust's
    )),

    // list yoinked from src/def.mth
    def: $ => choice(
      $.import_statement,
      $.function_definition
    ),



    module_declaration: $ => seq('module', $.identifier, '.', $.identifier),
    import_statement: $ => seq('import', $.identifier, '.', $.identifier),

    function_definition: $ => seq(
      optional('inline'),
      'def',
      field("function_name", $.identifier),
      optional(seq(
        '(',
        $.identifier, repeat(seq(',', $.identifier)),
        ')'
      )), // generics
      optional($.parameter_list),
      $.block // 'body' maybe?
    ),

    parameter_list: $ => seq(
      '[',
      repeat(alias($.identifier, $.argument)),
      optional(seq('|-', repeat(alias($.identifier, $.argument)))),
      optional(seq('--', repeat(alias($.identifier, $.argument)))),
      ']',
    ),

    block: $ => seq( '{', repeat($._expression), '}' ),

    _expression: $ => choice(
      $.number,
      $.identifier,
      $.stringliteral
    ),

    // higher LEXICAL prec'endence than identifier !!
    number: $ => token(prec(2, /[+-]?(0x|0o)?\d+(u|u8|u16|u32|u64|i8|i16|i32|i64)?/)),

    stringliteral: $ => seq(
      token.immediate('"'), // 'anything except newline'
      /[^\n]*/,
      token.immediate('"'),
    ),
    // "i.e. the ascii letters, digits, and symbols" excluding ,()[]{}\`."
    // ^ from the vim extension
    // (this is so ass but I don't actually know how to write regex-es)
    // (i'd call it 'word' but i think that's taken in tree-sitter)
    //identifier: $ => /([a-z]|[A-Z]|[0-9]|!|\$|%|&|´|\*|\+|-|\/|:|;|<|=|>|\?|@|\^|_|\||~)+/,
    identifier: $ => /[^()\[\]\{\},':\s]+/,
  }
});
