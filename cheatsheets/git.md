# Git cheat sheet

Distributed version control. The unit of work is the **commit**. The unit of collaboration is the **branch** plus the remote.

## Mental model

```text
working tree  --add-->  index/staging  --commit-->  local history  --push-->  remote
                <--checkout/restore--                  <--fetch/pull--
```

- `HEAD` is the current commit (usually the tip of the current branch).
- A branch is a movable pointer to a commit.
- A remote-tracking branch (`origin/main`) is a local cache of a remote pointer.
- Detached `HEAD` means you are on a commit, not a branch. Fine for inspection; do not pile new work there unless you create a branch first.

## Identity and first-time setup

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false    # or true, but pick one and stick to it
git config --global core.editor "vim"
```

Repo-local config omits `--global`. Prefer SSH remotes for push.

## Daily loop

```bash
git status
git diff                 # unstaged
git diff --cached        # staged
git add path
git add -p               # stage hunks
git commit -m "Subject line"

git fetch origin
git status -sb
git pull --ff-only origin main    # refuse to merge if fast-forward is impossible
git push origin HEAD
```

Commit subject: imperative, ~50 characters (`Fix null check in OrderService`). Body explains *why*.

## Branching

```bash
git switch -c feature/invoice-export
git switch main
git switch -
git branch -vv
git branch -d feature/invoice-export      # safe delete
git branch -D feature/invoice-export      # force
git push -u origin feature/invoice-export
```

Prefer `git switch` / `git restore` over overloaded `git checkout`.

### Integration styles

| Style | Command | Use |
|-------|---------|-----|
| Fast-forward | `git merge --ff-only` | Linear history when possible |
| Merge commit | `git merge --no-ff` | Preserve feature-branch topology |
| Rebase | `git rebase main` | Replay local commits on new base; do not rebase published shared branches |

```bash
git rebase main
git rebase --abort
git rebase --continue
```

Conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`. Fix files, `git add`, then continue.

## Inspect history

```bash
git log --oneline --decorate --graph --all
git log -S 'symbol' -- path          # pickaxe: commits that add/remove the string
git log -p -- path
git blame -L 40,80 path
git show COMMIT
git stash list
```

## Undo without panic

| Intent | Safe default |
|--------|----------------|
| Unstage a file | `git restore --staged path` |
| Discard unstaged edits | `git restore path` (destroys work) |
| Amend last *unpublished* commit | `git commit --amend` |
| Move HEAD, keep work | `git reset --soft HEAD~1` |
| Move HEAD and index, keep files | `git reset --mixed HEAD~1` (default) |
| Destroy commits and matching files | `git reset --hard HEAD~1` |
| Undo a published commit | `git revert COMMIT` (adds a new commit) |
| Recover a “lost” commit | `git reflog` then `git switch -c rescue COMMIT` |

Never `--force` push to `main`. `git push --force-with-lease` is the least-bad rewrite of a personal remote branch.

## Stash

```bash
git stash push -u -m "wip tests"
git stash pop
git stash drop
```

Stash is sticky tape. Prefer a WIP commit on a branch if the work might last.

## Remotes and collaboration

```bash
git remote -v
git remote add origin git@github.com:owner/repo.git
git fetch origin
git merge origin/main
git cherry-pick COMMIT
```

Pull requests: push a feature branch, open PR into `main`, delete the branch after merge.

## `.gitignore`

```gitignore
target/
*.class
.idea/
*.iml
.env
*.log
```

Already-tracked files are not ignored. Untrack with `git rm --cached path`.

## Tags and releases

```bash
git tag -a v1.4.0 -m "v1.4.0"
git push origin v1.4.0
```

Annotated tags are the release pins Maven and deployment notes should cite.

## Gotchas

- `git pull` without a policy can create surprise merge commits. Prefer `fetch` + explicit merge/rebase, or `pull --ff-only`.
- Line endings: `core.autocrlf` fights between Windows and Linux. In mixed teams, use `.gitattributes`.
- Submodules are easy to get wrong; avoid unless the dependency really is another repo you pin by commit.
- Large binaries do not belong in Git history. Use Git LFS or an artifact store.
