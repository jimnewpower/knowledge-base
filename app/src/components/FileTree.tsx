import type { TreeNode } from "../types";

type Props = {
  nodes: TreeNode[];
  selected: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
};

export default function FileTree({ nodes, selected, expanded, onToggle, onOpen }: Props) {
  return (
    <ul className="tree">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          selected={selected}
          expanded={expanded}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </ul>
  );
}

function TreeItem({
  node,
  selected,
  expanded,
  onToggle,
  onOpen,
}: {
  node: TreeNode;
  selected: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
}) {
  if (node.type === "dir") {
    const open = expanded.has(node.path);
    return (
      <li>
        <button type="button" className="tree-dir" aria-expanded={open} onClick={() => onToggle(node.path)}>
          <svg viewBox="0 0 16 16" className={open ? "chev open" : "chev"} aria-hidden="true">
            <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <span>{node.name}</span>
        </button>
        {open && node.children && (
          <ul className="children">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                selected={selected}
                expanded={expanded}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const label = node.title || node.name.replace(/\.md$/i, "");
  return (
    <li>
      <button
        type="button"
        className="tree-file"
        data-path={node.path}
        aria-current={node.path === selected ? "page" : undefined}
        title={label}
        onClick={() => onOpen(node.path)}
      >
        <span>{label}</span>
      </button>
    </li>
  );
}
