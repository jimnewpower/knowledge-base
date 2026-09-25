const paths: Record<string, string> = {
  "architecture-design": "M9 3h6v5H9z M3 16h6v5H3z M15 16h6v5h-6z M12 8v4 M6 16v-4h12v4",
  "languages-tools": "m8 6-6 6 6 6 m8-12 6 6-6 6 M14 3l-4 18",
  "application-development": "M3 4h18v13H3z M8 21h8 M12 17v4 M3 8h18",
  "apis-integration": "M3 7h6v6H3z M15 11h6v6h-6z M9 10h6V7 m0 7H9v3 M6 3v4 M18 17v4",
  "data-persistence": "M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0",
  "security-identity": "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z m-5 10 3 3 7-7",
  "testing-quality": "M8 3h8 M10 3v7l-6 9c-1 2 0 2 2 2h12c2 0 3 0 2-2l-6-9V3 M7 15h10",
  "delivery-operations": "M5 17 3 21l4-2 M9 15l-4-4 4-2c2-5 6-7 12-6 1 6-1 10-6 12l-2 4-4-4z M15 6h3v3h-3z",
  "gis-geospatial": "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18",
};

export default function CategoryIcon({ id }: { id: string }) {
  return <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[id]} /></svg>;
}
