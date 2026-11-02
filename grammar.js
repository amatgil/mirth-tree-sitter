/**
 * @file Tree-sitter parser for mirth
 * @author amatgil <amatgilvinyes@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const IDENTIFIERCHAR = /[^()\[\]\{\}.,':\s"]/;

export default grammar({
  name: "mirth",

  word: $ => $.verb, // took me a while to understand: TS will find all literals in this grammar
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
    comment: $ => choice(/#.*/, /\|\|\|.*/),

    // list yoinked from src/def.mth
    //     Alias
    //     Module
    //     Package
    //     Data
    //     Table
    //     Type
    //     Tag
    //     Prim
    //     Word
    //     Buffer
    //     External
    //     Field
    //     Macro
    def: $ => choice(
      $.import_statement,
      $.function_definition,
      $.struct_definition,
      $.data_definition,
      $.external_definition, // we also need external-with-loader i think?
      $.inline_block // no idea what this actually is, i found one in sdl2
    ),



    module_declaration: $ => seq('module', $.identifier, '.', $.identifier),
    import_statement: $ => seq('import', $.identifier, '.', $.identifier),

    block: $ => seq( '{', repeat($._expression), '}' ),
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
      repeat($.argument),
      optional(seq(token(prec(2,'|-')), repeat($.argument))),
      optional(seq(token(prec(2,'--')), repeat($.argument))),
      ']',
    ),
    argument: $ => seq(
      $.identifier,
      optional(seq(
        ":",
        $.identifier
    ))),

    struct_definition: $ => seq(
      'struct',
      field("struct_name", $.identifier),
      '{',
      repeat($.struct_attributes),
      optional(seq(
        token(prec(10,'--')),
        repeat($.function_definition),
      )),
      '}',
    ),
    struct_attributes: $ => seq(
      $.identifier,
      optional(seq(":",
        $.identifier, optional(seq("(", $.identifier, ")"))))
    ),

    data_definition: $ => seq(
      'data',
      field("data_name", $.identifier),
      '{',
      repeat($.identifier),
      optional(seq(
        token(prec(10,'--')),
        repeat($.function_definition),
      )),
      '}',
    ),

    external_definition: $ => seq('external', choice(
      seq('(', repeat1(seq($.identifier, $.parameter_list)), ')'),
      seq('{', repeat1(seq($.identifier, $.parameter_list)), '}'),
      seq($.identifier, $.parameter_list),
    )),

    inline_block: $ => seq('inline', '{', repeat($.function_definition), '}'),


    _expression: $ => choice(
      $.number,
      $.identifier,
      $.stringliteral,
      $.puntuacio,
      $.block // match blocks and such
    ),

    // higher LEXICAL precendence than identifier !!
    number: $ => token(prec(2, /[+-]?(0x[0-9a-fA-F]+|0o[0-8]+|\d+)(u|u8|u16|u32|u64|i8|i16|i32|i64)?/)),

    // TS detects and disallows rules that match the empty string. neat!
    stringliteral: $ => seq('"', optional($.stringcontent), '"'), // simplified from rust's
    stringcontent: $ => repeat1(choice($.escape_sequence, $.stringchar)),
    stringchar: $ => token.immediate(/[^\n"\\]/), // so it's named and can be highlighted separately from escapes
    escape_sequence: $ => token.immediate(seq('\\', choice('\n','n','r','t','\\','"'))),

    identifier: $ => choice(
      $.noun,
      $.stackop,
      $.verb
    ),
    // unicode letter casing is scary: ascii only
    // also this regex-as-strings manip is absolutely ass
    noun: $ => token(prec(3, new RegExp(/([A-Z]|\+[A-Z])/.source + '('+IDENTIFIERCHAR.source+')*'))),
    stackop: $ => choice(
      token(prec(2,new RegExp('>' + '('+IDENTIFIERCHAR.source+')+'))),
      token(prec(2,new RegExp('('+IDENTIFIERCHAR.source+')+' + '>'))),
    ),
    verb: $ => token(prec(1, new RegExp('('+IDENTIFIERCHAR.source+')+'))),
    puntuacio: $ => /(:|,|.|->)/
  }
});
