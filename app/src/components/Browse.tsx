import { categories } from "../data/categories";
import { availablePages, categoryFor, contentType, contentTypes, pageFor, pageTitle } from "../lib/catalog";
import type { CatalogPage, Category, ContentType } from "../lib/catalog";
import { home } from "../lib/navigation";
import type { LocationState, Navigate } from "../lib/navigation";
import type { IndexedDoc } from "../types";
import Breadcrumbs from "./Breadcrumbs";
import CategoryIcon from "./CategoryIcon";
import NavigationLink from "./NavigationLink";

type Props = { docs: IndexedDoc[]; location: LocationState; navigate: Navigate };

export default function BrowsePage({ loading, error, onRetry, ...props }: Props & { loading: boolean; error: string | null; onRetry: () => void }) {
  if (loading || error) {
    return <main id="main-content" className="browse-page" tabIndex={-1}>
      <p className="status" role={error ? "alert" : "status"}>{error ? `Could not load the library. ${error}` : "Loading the library…"}</p>
      {error && <button type="button" onClick={onRetry}>Retry</button>}
    </main>;
  }
  const category = categories.find((item) => item.id === props.location.category);
  if (props.location.category && !category) {
    return <main id="main-content" className="browse-page" tabIndex={-1}>
      <h1>Category not found</h1>
      <p>This category is not in the library.</p>
      <NavigationLink to={home} navigate={props.navigate}>Browse all categories</NavigationLink>
    </main>;
  }
  return category ? <CategoryPage key={category.id} category={category} {...props} /> : <HomePage {...props} />;
}

export function HomePage({ docs, navigate }: Props) {
  const count = categories.reduce((sum, category) => sum + availablePages(category, docs).length, 0);
  return <main className="browse-page" id="main-content" tabIndex={-1}>
    <header className="browse-header">
      <p className="eyebrow">The engineering library</p>
      <h1>Knowledge, ready to use.</h1>
      <p className="browse-intro">Practical references for designing, building, and operating software. Choose a topic or search for what you need.</p>
      <div className="browse-meta"><span>{categories.length} categories</span><span>{count} pages</span><NavigationLink to={{ ...home, doc: "README.md" }} navigate={navigate}>About this collection</NavigationLink></div>
    </header>
    <nav className="category-grid" aria-label="Browse categories">
      {categories.map((category) => <NavigationLink className="category-card" key={category.id} to={{ ...home, category: category.id }} navigate={navigate}>
        <CategoryIcon id={category.id} />
        <h2>{category.title}</h2>
        <p>{category.description}</p>
        <div className="category-card-foot"><span>{availablePages(category, docs).length} pages</span><span aria-hidden="true">↗</span></div>
      </NavigationLink>)}
    </nav>
  </main>;
}

export function CategoryPage({ category, docs, location, navigate }: Props & { category: Category }) {
  const pages = availablePages(category, docs);
  const byPath = new Map(docs.map((doc) => [doc.path, doc]));
  const tags = [...new Set(pages.flatMap((page) => page.tags))].sort();
  const matches = (page: CatalogPage) => byPath.has(page.path)
    && (location.type === "all" || contentType(page.path) === location.type)
    && (!location.tag || page.tags.includes(location.tag));
  const count = pages.filter(matches).length;
  const related = category.related.map(pageFor).filter((page): page is CatalogPage => Boolean(page && byPath.has(page.path)));

  return <main className="browse-page" id="main-content" tabIndex={-1}>
    <Breadcrumbs category={category} navigate={navigate} />
    <header className="browse-header category-header">
      <CategoryIcon id={category.id} />
      <p className="eyebrow">Explore the collection</p>
      <h1>{category.title}</h1>
      <p className="browse-intro">{category.description}</p>
    </header>
    <div className="category-filters">
      <label>Content type<select value={location.type} onChange={(event) => navigate({ ...location, type: event.target.value as ContentType | "all" })}>
        <option value="all">All types ({pages.length})</option>
        {Object.entries(contentTypes).map(([value, label]) => {
          const total = pages.filter((page) => contentType(page.path) === value).length;
          return <option key={value} value={value} disabled={!total}>{label} ({total})</option>;
        })}
      </select></label>
      <label>Topic<select value={location.tag} onChange={(event) => navigate({ ...location, tag: event.target.value })}>
        <option value="">All topics</option>
        {location.tag && !tags.includes(location.tag) && <option value={location.tag}>{location.tag}</option>}
        {tags.map((tag) => <option key={tag}>{tag}</option>)}
      </select></label>
      {(location.type !== "all" || location.tag) && <button type="button" className="clear-filters" onClick={() => navigate({ ...location, type: "all", tag: "" })}>Clear filters</button>}
      <span className="filter-count" role="status">{count} {count === 1 ? "page" : "pages"}</span>
    </div>
    {!count && <p className="category-empty">No pages match these filters. Choose another topic or clear the filters.</p>}
    {category.sections.map((section) => {
      const visible = section.pages.filter(matches);
      if (!visible.length) return null;
      return <section className="category-section" key={section.title}>
        <h2>{section.title}</h2>
        <ul className="page-list">{visible.map((page) => <PageItem key={page.path} page={page} doc={byPath.get(page.path)!} navigate={navigate} />)}</ul>
      </section>;
    })}
    {related.length > 0 && <section className="category-section related-topics">
      <h2>Related topics</h2>
      <p className="section-description">Useful references from other categories.</p>
      <ul className="page-list">{related.map((page) => <PageItem key={page.path} page={page} doc={byPath.get(page.path)!} navigate={navigate} related />)}</ul>
    </section>}
  </main>;
}

function PageItem({ page, doc, navigate, related = false }: { page: CatalogPage; doc: IndexedDoc; navigate: Navigate; related?: boolean }) {
  return <li><NavigationLink className="page-link" to={{ ...home, doc: page.path }} navigate={navigate}>
    <div><h3>{pageTitle(doc)}</h3><p>{page.description}</p><div className="page-labels"><span>{contentTypes[contentType(page.path)]}</span>{related ? <span>{categoryFor(page.path)?.title}</span> : page.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    <span className="page-arrow" aria-hidden="true">→</span>
  </NavigationLink></li>;
}
