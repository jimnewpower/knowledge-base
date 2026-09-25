# C cheat sheet

> Baseline: ISO[^iso] C17; GCC[^gcc]/Clang diagnostic examples on a supported Linux target. Reviewed: 2026-09-25.

Make buffer sizes, ownership, and error paths explicit. C provides no automatic bounds checking or object lifetime management.

Related: [scientific model integration](scientific-model-integration.md), [Linux diagnostics](linux-diagnostics.md), [static analysis and coverage](static-analysis-coverage.md).

## Types and lifetime

| Construct | Rule |
|-----------|------|
| `size_t` | Object sizes and indexes; print with `%zu`; beware unsigned subtraction |
| `int32_t`, `uint64_t` | Exact-width integers where provided; use `<stdint.h>` and `<inttypes.h>` formatting macros |
| Array versus pointer | An array usually decays to a pointer in expressions; a function parameter does not carry its length |
| `const T *p` | Cannot modify `T` through `p`; it says nothing about allocation ownership |
| Automatic storage | Lifetime ends when the block exits; never return a pointer to a local array |
| Allocated storage | Every successful allocation needs a clear eventual owner and `free` |

`sizeof(array)` works where the actual array type is visible; `sizeof(pointer)` returns the pointer size. Strings require space for a terminating NUL[^nul]. Binary buffers need an explicit length and may contain zero bytes.

## Memory and error rules

- Check allocation multiplication before `malloc`: reject `count > SIZE_MAX / sizeof *items` for a nonzero element size. Include the headers declaring each type/macro.
- Assign `realloc` to a temporary pointer. On failure with a nonzero requested size, the original allocation remains yours. Handle zero-size requests separately.
- Do not read uninitialized or freed storage, access beyond bounds, or dereference a one-past-the-end pointer.
- Signed integer overflow is undefined behavior. Unsigned wrap is defined arithmetic, but usually still an application bug for sizes.
- Check API[^api]-specific return values. Read `errno` only when the failing API documents its use; success does not reset it.
- A single cleanup label is reasonable for releasing multiple resources; keep each resource's ownership obvious.

For numeric input, prefer a checked `strtol`/`strtod` conversion with end-pointer, range, and trailing-input checks over `atoi`. Define whether whitespace, locale-specific numbers, and non-finite values are accepted.

## Build and diagnose

From a directory containing your own `model.c`; sanitizer support depends on compiler and target. These commands produce and execute a local diagnostic build.

```bash
cc -std=c17 -Wall -Wextra -Wpedantic -Wconversion -g -O1 \
  -fsanitize=address,undefined -fno-omit-frame-pointer model.c -o model-check
./model-check
```

AddressSanitizer and UndefinedBehaviorSanitizer expose selected errors on executed paths; they are not a proof of memory safety. Use a separate ThreadSanitizer build for supported multithreaded targets; do not combine it with AddressSanitizer.

## References

- [GCC warning options](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html)
- [GCC instrumentation and sanitizer options](https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html)
- [SEI CERT C coding standard](https://wiki.sei.cmu.edu/confluence/display/c)[^sei][^cert]

[^iso]: International Organization for Standardization — ISO is its official short name, rather than an English initialism.
[^gcc]: GNU Compiler Collection; GNU expands recursively to “GNU's Not Unix.”
[^nul]: Null character — the zero-valued byte that terminates a C string.
[^api]: Application Programming Interface — the contract through which software components interact.
[^sei]: Software Engineering Institute.
[^cert]: Originally Computer Emergency Response Team; here, the name of the secure-coding program at Carnegie Mellon University.
