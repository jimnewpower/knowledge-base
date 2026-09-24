# Bash cheat sheet

> Baseline: Bash 5.x with GNU/Linux utilities; Bash syntax is not portable /bin/sh syntax. Reviewed: 2026-09-24.

Bash is the default interactive shell on most Linux systems and the language of delivery scripts. Write for `bash`, not for an unspecified `/bin/sh`, unless you need POSIX portability.

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- `-e` exit on some unhandled failures; conditions, `&&`/`||` lists, and other contexts have exceptions
- `-u` treat unset variables as errors
- `-o pipefail` fail a pipeline if any stage fails

These options do not replace explicit error handling. For example, `grep` returns 1 for no match, and `-e` may be ignored inside a function invoked as a condition.

## Filesystem and navigation

```bash
pwd
ls -la
ls -ltr                     # oldest first; last line is newest
cd -
cd "$HOME"
mkdir -p path/to/dir
cp -a src dest              # archive: mode, timestamps, recurse
mv old new
rm -rf dir                  # irreversible
find . -name '*.java' -print
find . -type f -mtime -1    # files changed in last day
du -sh *
df -h
```

## Reading and transforming text

```bash
cat file
less file
head -n 20 file
tail -n 20 file
tail -f /var/log/app.log
wc -l file
sort file | uniq -c | sort -nr
cut -d',' -f1,3 file
tr '[:upper:]' '[:lower:]'
tee out.log                 # stdout to screen and file
```

`grep`, `sed`, and `awk` cover most one-liners:

```bash
grep -RIn --exclude-dir=target 'TODO' .
grep -E 'ERROR|FATAL' app.log
sed -n '20,40p' file
sed 's/foo/bar/g' file
awk -F',' '{print $2}' file
awk '{sum += $1} END {print sum}'
```

See also [regex.md](regex.md).

## Variables and quoting

```bash
name="Ada"
echo "$name"
echo '${name} is literal'
echo "exit was $?"
echo "pid $$"
```

| Quote | Behavior |
|-------|----------|
| `"..."` | Expand variables and `$(...)` |
| `'...'` | Literal |
| none | Word-split and glob — usually wrong for paths |

```bash
# Always quote paths
cp -- "$src" "$dest"

# Default and required
: "${HOST:=localhost}"
: "${API_KEY:?API_KEY must be set}"
```

## Expansion

```bash
echo "${#name}"             # length
echo "${name%.txt}"         # strip shortest suffix
echo "${name##*/}"          # basename-like
echo "${name%/*}"           # dirname-like; unchanged if there is no slash
files=(*.md)
echo "${files[@]}"
echo "${#files[@]}"
```

Globs: `*` `?` `[abc]`. Enable recursive glob with `shopt -s globstar` then `**/*.java`.

An unmatched glob stays literal by default. Use `shopt -s nullglob` when an empty match should produce an empty array or no loop iterations.

## Control flow

```bash
if [[ -f "$file" && -r "$file" ]]; then
  echo readable
elif [[ -d "$file" ]]; then
  echo directory
else
  echo missing
fi

[[ "$x" == foo* ]] || exit 1

case "$cmd" in
  start) start_svc ;;
  stop)  stop_svc  ;;
  *)     echo "usage: $0 start|stop" >&2; exit 2 ;;
esac

for f in *.md; do
  printf '%s\n' "$f"
done

while IFS= read -r line; do
  printf '%s\n' "$line"
done < file
```

`[[ ... ]]` is Bash. `[ ... ]` is POSIX `test`. Prefer `[[` in Bash scripts.

| Test | Meaning |
|------|---------|
| `-f` | regular file |
| `-d` | directory |
| `-e` | exists |
| `-z` | string empty |
| `-n` | string non-empty |
| `-eq -ne -lt -le -gt -ge` | integer compare |

## Functions, arguments, exit status

```bash
usage() { echo "usage: $0 <env>" >&2; }

main() {
  local env="${1:?env required}"
  echo "deploying $env"
}

main "$@"
```

| Special | Meaning |
|---------|---------|
| `$0` | script name |
| `$1`, `${2}`, … `${10}` | positional arguments; braces required for two-digit positions |
| `$#` | argument count |
| `"$@"` | all args, correctly quoted |
| `$?` | last exit status |
| `"${PIPESTATUS[@]}"` | statuses of all pipeline stages; `$PIPESTATUS` alone is element zero |

Exit `0` success, non-zero failure. Reserve `2` for usage errors.

Capture `PIPESTATUS` immediately after the pipeline, before another command overwrites it. With `set -e -o pipefail`, an unhandled failed pipeline can exit before the capture; place it in an explicit error-handling context when collecting failures.

## Pipelines, redirection, jobs

```bash
cmd > file          # stdout
cmd >> file         # append
cmd 2> file         # stderr
cmd &> file         # both
cmd >file 2>&1      # portable both
cmd < file
cmd1 | cmd2
cmd &
wait
```

Process substitution: `diff <(sort a) <(sort b)`.

## Useful one-liners for engineering

```bash
# JSON-ish pretty print if jq is installed
jq . response.json

# Wait for a port
until bash -c "echo >/dev/tcp/127.0.0.1/8080" 2>/dev/null; do sleep 1; done

# Directory containing this Bash script (does not resolve a symlink to the script)
root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

## Gotchas

- Word splitting on unquoted `$var` breaks paths with spaces.
- With empty `$dir`, `rm -rf $dir` has no operand; it does not delete the current directory. Actual hazards include word splitting, globbing, and an empty variable in a larger path such as `"$dir/"`. Validate a nonempty target inside the intended root, quote it, and use `--`. `set -u` catches unset variables, not empty ones; `${dir:?dir required}` rejects both.
- Pipelines run in subshells; variables assigned inside `cmd | while read` do not persist.
- `ls` is for humans. In scripts, use globs or `find`.
- Do not parse `ls` output.

## References

- [GNU Bash reference manual](https://www.gnu.org/s/bash/manual/bash.html)
- [GNU Coreutils — rm behavior](https://www.gnu.org/s/coreutils/manual/html_node/rm-invocation.html)
