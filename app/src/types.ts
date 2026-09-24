export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "dir";
  title?: string;
  children?: TreeNode[];
};

export type IndexedDoc = {
  id: string;
  path: string;
  title: string;
  text: string;
};

export type SearchHit = {
  path: string;
  title: string;
  score: number;
  snippet: string;
};

export type OutlineItem = {
  depth: number;
  text: string;
  id: string;
};
