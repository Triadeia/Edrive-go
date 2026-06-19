function inlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function MarkdownDocument({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="document-body">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 12)}`;
        if (!line.trim()) return <div key={key} className="document-space" />;
        if (line.startsWith("#### ")) return <h4 key={key}>{inlineMarkdown(line.replace(/^####\s+/, ""))}</h4>;
        if (line.startsWith("### ")) return <h3 key={key}>{inlineMarkdown(line.replace(/^###\s+/, ""))}</h3>;
        if (line.startsWith("## ")) return <h2 key={key}>{inlineMarkdown(line.replace(/^##\s+/, ""))}</h2>;
        if (line.startsWith("# ")) return <h1 key={key}>{inlineMarkdown(line.replace(/^#\s+/, ""))}</h1>;
        if (line.startsWith("> ")) return <blockquote key={key}>{inlineMarkdown(line.replace(/^>\s+/, ""))}</blockquote>;
        if (line.startsWith("|")) return <pre key={key} className="document-table">{line}</pre>;
        if (line.startsWith("---")) return <hr key={key} />;
        if (/^\d+\.\s+/.test(line)) return <p key={key} className="document-list">{inlineMarkdown(line)}</p>;
        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={key} className="document-list">{inlineMarkdown(line)}</p>;
        return <p key={key}>{inlineMarkdown(line)}</p>;
      })}
    </div>
  );
}
