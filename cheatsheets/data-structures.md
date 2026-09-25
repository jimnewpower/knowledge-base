# Data structures cheat sheet

> Baseline: Java 21 collections; average, amortized, and worst-case costs differ as noted. Reviewed: 2026-09-24.

A data structure is a **layout plus allowed operations**. Pick from the operations you need (lookup, insert, ordered scan, min, merge), not from habit.

Complexities below are typical average / common-case for the usual implementations. Worst case is noted when it surprises people.

## Linear

| Structure | Java | Access | Insert/delete | Notes |
|-----------|------|--------|---------------|-------|
| Array / `ArrayList` | `ArrayList<T>` | O(1) index | amortized O(1) append; O(n) middle | Default list. Contiguous, cache-friendly |
| Linked list | `LinkedList<T>` | O(n) | O(1) given a node | Rarely the right default in Java |
| Stack | `ArrayDeque<T>` | top O(1) | amortized O(1) at an end | Prefer over `java.util.Stack` |
| Queue / deque | `ArrayDeque<T>` | ends O(1) | amortized O(1) at ends | Also the stack |
| Ring buffer | custom / disruptor | O(1) | O(1) overwrite | Bounded, good for telemetry |

## Associative

| Structure | Java | Lookup | Insert | Notes |
|-----------|------|--------|--------|-------|
| Hash table | `HashMap` / `HashSet` | average O(1) | average O(1) | Needs `equals`/`hashCode`. Worst O(n) if hashes collapse |
| Linked hash | `LinkedHashMap` | average O(1) | average O(1) | Predictable iteration / LRU[^lru] building block |
| Balanced tree | `TreeMap` / `TreeSet` | O(log n) | O(log n) | Sorted by `compareTo` |
| Hash + concurrency | `ConcurrentHashMap` | average O(1) | average O(1) | Default concurrent map |
| Identity map | `IdentityHashMap` | average O(1) | average O(1) | `==` not `equals` — rare |

## Hierarchical and graph

| Structure | Use |
|-----------|-----|
| Binary tree / BST[^bst] | Ordered hierarchy; prefer balanced (`TreeMap`) over hand-rolled BST |
| Heap | Priority queue — `PriorityQueue` is a binary heap, peek min/max O(1), insert O(log n) |
| Trie | Prefix search, dictionaries |
| Graph (adj list) | Networks, dependencies, workflows — `Map<N, List<N>>` |
| Graph (adj matrix) | Dense graphs, O(1) edge query, O(v²) memory |
| Union-find | Clustering, Kruskal, connectivity |

## Specialized

| Structure | Use |
|-----------|-----|
| Bloom filter | Definitely absent or possibly present; a standard correctly maintained filter has false positives, no false negatives |
| LRU cache | Access-ordered `LinkedHashMap` (`accessOrder=true`) with `removeEldestEntry` |
| B-tree / B+ | Databases and filesystems; you consume these, you rarely write them |
| Column / packed arrays | Scientific and geospatial numeric data — locality beats objects |

Local, single-threaded bounded-cache example (the third constructor argument enables access order):

```java
var cache = new LinkedHashMap<String, String>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
        return size() > 100;
    }
};
```

Default insertion order evicts the oldest insertion, not the least recently accessed entry. Access-order reads can modify the map; concurrent use requires synchronization or a purpose-built cache.

## How to choose

Example abbreviations: DB[^db].

```text
Need index by position?          list / array
Need key -> value?               hash map
Need keys in order / ranges?     tree map
Need next-best by priority?      heap
Need FIFO work queue?            deque
Need graph walk?                 adj list
Need unique membership?          hash set
Need prefix match?               trie or DB index
Need bounded memory, approx?     bloom / LRU
```

If the data already lives in the database and the working set is large, the *database index* is the data structure. Do not load the table to sort it in Java without a reason.

## Invariants to protect

- A `HashMap` key must not change its `hashCode` while it is in the map.
- `TreeMap` keys must have a consistent total order (`compareTo` consistent with `equals` unless you like lost entries).
- Concurrent structures are not a substitute for a clear ownership story. A `ConcurrentHashMap` of mutable values can still race.

## Gotchas

- `LinkedList` as a queue is slower than `ArrayDeque` for almost all application code.
- Boxing: `List<Integer>` is not an `int[]`. For tight numeric loops, use primitive arrays or specialized collections.
- Returning an internal `List` from an entity leaks structure. Copy or wrap unmodifiable.
- Measuring beats folklore once `n` is large or the hot path is in a GC[^gc]-sensitive service.

## References

- [Java 21 — LinkedHashMap access order and eviction](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html)
- [Java 21 — ArrayDeque operation costs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayDeque.html)

[^lru]: Least Recently Used.
[^bst]: Binary Search Tree.
[^gc]: Garbage Collection (or Garbage Collector, depending on context).
[^db]: Database.
