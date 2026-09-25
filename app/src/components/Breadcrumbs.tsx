import type { Category } from "../lib/catalog";
import { home } from "../lib/navigation";
import type { Navigate } from "../lib/navigation";
import NavigationLink from "./NavigationLink";

export default function Breadcrumbs({ category, title, navigate }: { category?: Category; title?: string; navigate: Navigate }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li><NavigationLink to={home} navigate={navigate}>Home</NavigationLink></li>
      {category && <li>{title
        ? <NavigationLink to={{ ...home, category: category.id }} navigate={navigate}>{category.title}</NavigationLink>
        : <span aria-current="page">{category.title}</span>}</li>}
      {title && <li><span aria-current="page">{title}</span></li>}
    </ol>
  </nav>;
}
