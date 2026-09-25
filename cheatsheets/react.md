# React fundamentals cheat sheet

> Baseline: React 19 function components and Hooks with TypeScript; client-rendered examples. Reviewed: 2026-09-25.

Use this when choosing component state, handling actions, or diagnosing unnecessary Effects. JSX retains the need for correct browser semantics.

Related: [HTML and CSS](html-css-browser.md), [TypeScript](typescript.md), [accessibility](accessibility.md), [React Native offline data](react-native-offline.md).

## State ownership

| Situation | Starting choice |
|-----------|-----------------|
| Value derived from props/state | Calculate during rendering |
| Two controls edit one value | Lift ownership to their common parent |
| Related transitions enforce invariants | Consider a reducer |
| Mutable handle not used in rendering | A ref |
| Remote data | Explicit loading/error states and cache/refetch policy |

Avoid independently editable copies of derived state. Stable keys preserve list identity; changing a key resets component state. See [managing state](https://react.dev/learn/managing-state).

## Controlled component

Complete TSX module for a React/TypeScript application. Topic names must be unique; editable or duplicate labels need stable record IDs instead.

```tsx
import { useState } from "react";

export default function TopicFilter({ topics }: { topics: string[] }) {
  const [query, setQuery] = useState("");
  const matching = topics.filter((topic) =>
    topic.toLowerCase().includes(query.trim().toLowerCase()));

  return <section>
    <label>Filter topics
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
    </label>
    <p role="status">{matching.length} matches</p>
    <ul>{matching.map((topic) => <li key={topic}>{topic}</li>)}</ul>
  </section>;
}
```

The list is derived without another state variable. Lowercasing is a simple search policy, not a complete locale-sensitive matcher.

## Events versus Effects

Handle user-triggered writes in event handlers. Use Effects to synchronize external subscriptions, timers, or imperative widgets. Declare dependencies and undo subscriptions/timers during cleanup. Development Strict Mode exercises an extra setup/cleanup cycle.

Cancel or ignore obsolete asynchronous reads so an older response cannot replace a newer selection. Cleanup does not undo a server mutation. See [synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).

## Verification

Exercise empty data, rapid input changes, failed requests, unmount/remount, and keyboard use. Avoid in-place state mutation. Use updater functions when the next value depends on the previous value; measure before adding memoization.

Content-example tests type-check this module and exercise filtering and empty results. They do not establish full application correctness.
