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
      /[^\n\r]*/
    )),

    // list yoinked from src/def.mth
    def: $ => choice(
      $.import_statement,
      $.function_definition
    ),



    module_declaration: $ => seq('module', $.ascii_alphanum, '.', $.ascii_alphanum),
    import_statement: $ => seq('import', $.ascii_alphanum, '.', $.ascii_alphanum),

    function_definition: $ => seq(
      optional('inline'),
      'def',
      $.identifier,
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
      repeat1($.identifier),
      optional(seq("|-", repeat1($.identifier))),
      optional(seq("--", repeat1($.identifier))),
      ']',
    ),

    block: $ => seq( '{', repeat($.expression), '}' ),

    expression: $ => choice(
      $.identifier,
      $.number
    ),

    number: $ =>  prec(1, /\d+u?/), // higher prec'endence than identifier !!

    string_literal: $ => seq(
      token.immediate('"'), // 'anything except newline'
      /[^\n]*/,
      token.immediate('"'),
    ),
    // "i.e. the ascii letters, digits, and symbols" excluding ,()[]{}\`."
    // ^ from the vim extension
    // (this is so ass but I don't actually know how to write regex-es)
    // (i'd call it 'word' but i think that's taken in tree-sitter)
    identifier: $ => /([a-z]|[A-Z]|[0-9]|!|\$|%|&|´|\*|\+|-|\/|:|;|<|=|>|\?|@|\^|_|\||~)+/,

    // I made this one up tremendously based on other langs' I know (e.g. rust)
    ascii_alphanum: $ => /([a-z]|[A-Z]|_)([a-z]|[A-Z]|[0-9]|_)*/
  }
});
