# Tree-sitter grammar for mirth

Basic grammar for [mirth](https://codeberg.org/typeswitch/mirth), the concatenative stack language.


Broken stuff so far
- [-] `Foo.bar` leaves the `.` dangling
- [ ] `--` and `|-` are parsed as verbs, breaking a lot of things (e.g. parameter lists and the separation between a struct's attributes and its methods)
- [ ] the snake example has some strings that aren't detected properly for some reason
- [ ] the snake example also has broken comments (the ones inside the struct only, somehow)
