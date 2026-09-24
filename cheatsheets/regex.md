# Regular expressions cheat sheet

A regular expression is a **pattern that matches text**. In Java it is `java.util.regex`; in Bash it is whatever `grep -E` / `[[ =~ ]]` implements. They are not the same dialect. When it matters, say which engine.

## Literal and metacharacters

```
. ^ $ * + ? { } [ ] \ | ( )
```

To match them literally, escape: `\.` `\(` `\\`.

| Atom | Matches |
|------|---------|
| `.` | one character (not newline, unless DOTALL) |
| `^` `$` | start / end of string (or line in multiline) |
| `\A` `\z` | start / end of string (Java) |
| `\d` `\D` | digit / not digit |
| `\w` `\W` | word char `[A-Za-z0-9_]` / not |
| `\s` `\S` | whitespace / not |
| `\b` | word boundary |

## Character classes

```
[abc]       a or b or c
[^abc]      not those
[a-z]       range
[a-zA-Z0-9]
[[:digit:]] POSIX class in some engines, not in Java
```

Inside `[]`, most metacharacters are literal. `]` `-` `^` `\ ` still need care: put `-` at the end, `^` not first unless you mean negate.

## Quantifiers

| Quantifier | Meaning |
|------------|---------|
| `?` | 0 or 1 |
| `*` | 0 or more |
| `+` | 1 or more |
| `{n}` | exactly n |
| `{n,}` | n or more |
| `{n,m}` | n to m |

Greedy by default (`.*` eats as much as it can while still matching).  
Lazy: `*?` `+?` `??` `{n,m}?`.  
Possessive (Java): `*+` `++` — no backtrack.

## Groups and alternation

```
(abc)       capturing group
(?:abc)     non-capturing
(?<name>abc) named group (Java)
a|b         a or b
```

```java
var m = Pattern.compile("(?<code>[A-Z]+)-(?<n>\\d+)").matcher("AB-12");
if (m.matches()) {
    String code = m.group("code");
}
```

In replacements: `$1` or `${name}` (Java). In Bash `sed`, backrefs are `\1`.

## Lookaround (Java and most modern engines)

```
(?=...)   followed by
(?!...)   not followed by
(?<=...)  preceded by
(?<!...)  not preceded by
```

Lookarounds do not consume. Variable-length lookbehind is limited in Java.

## Flags

| Java flag | Usual meaning |
|-----------|----------------|
| `i` `Pattern.CASE_INSENSITIVE` | ignore case |
| `m` `MULTILINE` | `^` `$` per line |
| `s` `DOTALL` | `.` matches newline |
| `u` `UNICODE_CASE` | with `i`, Unicode-aware |

```bash
grep -Ei 'error|fatal' app.log
```

## Java usage

```java
private static final Pattern SKU = Pattern.compile("[A-Z]{3}-\\d{4}");

boolean ok = SKU.matcher(input).matches();   // entire string
boolean found = SKU.matcher(input).find();   // substring

input.replaceAll("\\s+", " ");
```

Compile once if reused. `String.matches(regex)` recompiles every call and means *full* match.

## When not to use regex

- HTML / XML / JSON structure — use a parser.
- Nested constructs (“balanced parentheses” of arbitrary depth) — regex is the wrong machine.
- Validating email to RFC completeness — you will get it wrong; do a practical check and send a confirmation.
- Secret scanning of binary files.

## Catastrophic backtracking

```
(a+)+b     against  aaaaaaaaaaaaaac
```

The engine tries enormous partitions. Tighten the pattern, use possessive quantifiers, or stop using regex.

## Gotchas

- `\\d` in a Java *string* is `\d` to the engine. Double the backslashes in Java source, or use a text block carefully.
- `grep` basic regex treats `(` as literal unless you pass `-E`.
- Greedy `.*` across the whole file is how you accidentally match from the first quote to the last.
- Locale and Unicode: `[A-Z]` is not “any letter.”
