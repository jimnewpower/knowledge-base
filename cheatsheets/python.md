# Python cheat sheet

> Baseline: Python 3.11+; standard library examples, project-pinned dependencies. Reviewed: 2026-09-25.

Use a project environment, explicit data boundaries, and context managers for resources. Type hints improve checking but do not validate runtime input.

Related: [scientific model integration](scientific-model-integration.md), [reproducible builds](reproducible-builds.md), [Bash](bash.md).

## Isolated environment

PowerShell, in an existing project with a reviewed `requirements.txt`. Calling the environment interpreter directly avoids activation-policy differences.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

On Linux, use `python3 -m venv .venv` and `.venv/bin/python`. Commit dependency declarations/lock inputs, not `.venv`. Pin transitive dependencies and hashes when repeatability requires them; `pip freeze` records an installed environment but does not establish package provenance.

## Language at the keyboard

| Feature | Example / caution |
|---------|-------------------|
| Comprehension | `[item.id for item in items if item.active]`; use a loop when logic becomes hard to read |
| Lazy iteration | `(parse(line) for line in stream)`; consume before the stream closes |
| Mapping lookup | `mapping.get(key)` can conflate missing with a stored `None` |
| Equality | `==` compares values; `is` compares identity; use `is None` |
| Defaults | Use `None` then create a list in the body; a default `[]` is shared across calls |
| Data objects | `@dataclass(frozen=True)` prevents field assignment, not mutation inside a contained list |
| Exceptions | Catch the expected exception; use `raise NewError(...) from exc` when translating at a boundary |

## Files and child processes

Independent standard-library fragments; `config.json` and `model.py` are project-owned files in the current directory. The command requires an isolated, trusted model script.

```python
import json
from pathlib import Path

with Path("config.json").open(encoding="utf-8") as stream:
    config = json.load(stream)
if not isinstance(config, dict):
    raise ValueError("Configuration must be a JSON object")
```

```python
import subprocess
import sys

result = subprocess.run(
    [sys.executable, "model.py", "--input", "measurements.csv"],
    check=True, capture_output=True, text=True, timeout=60,
)
```

Validate required fields after parsing. The process example buffers output in memory; stream or redirect large output and handle descendant processes explicitly. Passing an argument list avoids shell expansion, but does not make the invoked program or arguments trustworthy.

## Failure modes

Do not deserialize untrusted pickle files. Do not assume threads speed up CPU-bound Python work; benchmark the deployed interpreter and native extensions, and consider processes for isolation/parallelism. Async I/O still needs timeouts and bounded concurrency. Use `logging` for application diagnostics and keep secrets out of exception context.

## References

- [Python virtual environments](https://docs.python.org/3/tutorial/venv.html)
- [Python subprocess](https://docs.python.org/3/library/subprocess.html)
- [Python dataclasses](https://docs.python.org/3/library/dataclasses.html)
