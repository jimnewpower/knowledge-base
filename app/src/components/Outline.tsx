import type { OutlineItem } from "../types";

type Props = {
  items: OutlineItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function Outline({ items, activeId, onSelect }: Props) {
  if (!items.length) return <aside className="outline" />;
  return (
    <nav className="outline" aria-label="On this page">
      <div className="outline-label">On this page</div>
      <ol>
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "depth-3" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? "location" : undefined}
              onClick={(event) => {
                event.preventDefault();
                onSelect(item.id);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
