import fs from "node:fs";
import path from "node:path";
import { documents, type EdriveDocument } from "@/lib/document-catalog";

export { documents };
export type { DocumentCategory, EdriveDocument } from "@/lib/document-catalog";

export function getDocument(id: string) {
  return documents.find((document) => document.id === id);
}

export function getDocumentContent(document: EdriveDocument) {
  const fullPath = path.join(process.cwd(), "content", "documents", document.fileName);
  return fs.readFileSync(fullPath, "utf8");
}

export function getDocumentStats(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const headings = content.split("\n").filter((line) => line.startsWith("#")).length;
  return { words, headings };
}
