# Algorithms cheat sheet

> Baseline: Conventional sequential algorithms; Java 21 library examples. Complexity assumptions are stated per operation. Reviewed: 2026-09-24.

An algorithm is a **procedure with a cost**. Cost is usually time and extra memory as a function of input size. Prefer a clear O(n log n) you can test over a clever O(n) you cannot maintain.

See [data-structures.md](data-structures.md).

## Asymptotics

| Notation | Means |
|----------|--------|
| O(1) | Bounded work |
| O(log n) | Halves the search space (binary search, heap, balanced tree) |
| O(n) | Proportional to input |
| O(n log n) | Good sorts, many “almost linear” algorithms |
| O(n²) | Nested scans; fine for tiny n |
| O(2ⁿ), O(n!) | Only for tiny n or with heavy pruning |

Big-O hides constants. For n = 50, a tight n² loop can beat a heavy n log n with allocations. Measure the hot path.

## Sorting and selection

| Algorithm | Time | Stable | Notes |
|-----------|------|--------|-------|
| Timsort (`Arrays.sort` objects) | O(n log n) | yes | Java’s object sort |
| Dual-pivot quicksort (`Arrays.sort` primitives) | O(n log n) typical | no | Java primitives |
| Heap sort | O(n log n) | no | In-place, not Java’s default |
| Counting / radix | O(n + k) | can be | Integers with limited range |

Selection: nth element — `PriorityQueue` or Quickselect (average O(n)). For “top k”, a heap of size k is O(n log k).

## Search

| Algorithm | Time | Requires |
|-----------|------|----------|
| Linear scan | O(n) | nothing |
| Binary search | O(log n) | sorted random-access |
| Hash lookup | average O(1) | `hashCode`/`equals` |
| BFS | O(V + E) | graph, unweighted shortest path |
| Dijkstra | O((V + E) log V) with heap | non-negative weights |
| A* | like Dijkstra + heuristic | admissible heuristic |
| DFS / recursion on trees | O(V + E) | watch stack depth |
| Binary search on answer | O(log range × check) | monotonic predicate |

```java
int i = Arrays.binarySearch(sorted, key); // negative insertion point if absent
```

## Graph essentials

- **Topological sort** — Kahn or DFS; fails if a cycle exists. Build systems and course-prereq problems.
- **Union-find** — almost O(1) amortized with path compression + union by rank.
- **Cycle detection** — DFS colors, or union-find on undirected edges.
- **SCC** — Kosaraju / Tarjan, when “mutually reachable” matters.

## Strings

| Algorithm | Use |
|-----------|-----|
| KMP / Boyer–Moore | Single pattern in a long string (often the library is enough) |
| Trie / Aho–Corasick | Many patterns |
| Edit distance (Levenshtein) | DP, O(nm) |
| Rolling hash | Similarity / rabin-karp; watch collisions |

Regex is an algorithm family of its own — [regex.md](regex.md). Catastrophic backtracking is O(2ⁿ) in disguise.

## Dynamic programming pattern

1. Name the subproblem (`dp[i] = best for prefix i`).
2. Recurrence + base case.
3. Decide bottom-up table vs memoized recursion.
4. Recover the solution if you need the choices, not only the cost.

Classic: knapsack, LIS, edit distance, matrix chain, shortest paths (Bellman–Ford).

## Recursion and divide-and-conquer

```text
base case
split
solve parts
combine
```

Merge sort, binary search, tree walks. Convert to explicit stack or iteration when depth ≈ n (linked lists).

## Practical selection guide

```text
Need sorted output?              library sort
Need few largest?                heap of size k
Need membership?                 HashSet
Need shortest unweighted path?   BFS
Need shortest nonnegative path?  Dijkstra
Need dependencies honored?       topological sort
Need "first n that satisfies"?   binary search on answer
Need overlap of subproblems?     DP
```

## Gotchas

- Recursion on user-shaped trees can blow the stack. Bound depth or iterate.
- Floating-point “equality” in geometric algorithms needs an epsilon policy.
- Shuffling with `Random.nextInt` + swap is Fisher–Yates. Do not sort by `random()`.
- “O(1) hash” assumes a decent hash function and load factor.
- Copying an algorithm from a contest site into a service without tests is how off-by-one becomes production.

## References

- [Sedgewick and Wayne — algorithm complexity reference](https://algs4.cs.princeton.edu/cheatsheet/)
- [Java 21 — Arrays sorting and search contracts](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html)
