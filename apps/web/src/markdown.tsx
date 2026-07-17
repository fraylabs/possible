import type { ReactNode } from "react";
import { hrefToSlug, wikiPath } from "./wiki";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

type InlineToken =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

const headingPattern = /^(#{2,4})\s+(.+)$/;
const unorderedListPattern = /^[-*]\s+(.+)$/;
const orderedListPattern = /^\d+\.\s+(.+)$/;
const inlinePattern = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;

const safeExternalHref = (href: string): string | undefined => {
  try {
    const url = new URL(href);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const headingMatch = line.match(headingPattern);
    if (headingMatch) {
      flushParagraph();
      const level = Math.min(Math.max(headingMatch[1]!.length, 2), 4) as 2 | 3 | 4;
      blocks.push({ type: "heading", level, text: headingMatch[2]!.trim() });
      continue;
    }

    const unorderedMatch = line.match(unorderedListPattern);
    const orderedMatch = line.match(orderedListPattern);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      const ordered = Boolean(orderedMatch);
      const items: string[] = [];
      let offset = index;
      while (offset < lines.length) {
        const nextLine = lines[offset]!.trim();
        const match = ordered
          ? nextLine.match(orderedListPattern)
          : nextLine.match(unorderedListPattern);
        if (!match) break;
        items.push(match[1]!.trim());
        offset += 1;
      }
      blocks.push({ type: "list", ordered, items });
      index = offset - 1;
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(inlinePattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    if (match[1] && match[2]) {
      tokens.push({ type: "link", label: match[1], href: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "code", value: match[3] });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}

function renderInline(
  text: string,
  onSelectPage: (slug: string) => void,
): ReactNode[] {
  return parseInline(text).map((token, index) => {
    if (token.type === "text") {
      return <span key={`text:${index}`}>{token.value}</span>;
    }

    if (token.type === "code") {
      return <code key={`code:${index}`}>{token.value}</code>;
    }

    const internalSlug = hrefToSlug(token.href);
    if (internalSlug) {
      return (
        <a
          key={`link:${index}`}
          href={wikiPath(internalSlug)}
          onClick={(event) => {
            event.preventDefault();
            onSelectPage(internalSlug);
          }}
        >
          {token.label}
        </a>
      );
    }

    const safeHref = safeExternalHref(token.href);
    if (!safeHref) {
      return <span key={`link:${index}`}>{token.label}</span>;
    }

    return (
      <a key={`link:${index}`} href={safeHref} target="_blank" rel="noreferrer">
        {token.label}
      </a>
    );
  });
}

interface MarkdownRendererProps {
  markdown: string;
  onSelectPage: (slug: string) => void;
}

export function MarkdownRenderer({ markdown, onSelectPage }: MarkdownRendererProps) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="markdown-content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return <h2 key={`heading:${index}`}>{renderInline(block.text, onSelectPage)}</h2>;
          }
          if (block.level === 3) {
            return <h3 key={`heading:${index}`}>{renderInline(block.text, onSelectPage)}</h3>;
          }
          return <h4 key={`heading:${index}`}>{renderInline(block.text, onSelectPage)}</h4>;
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={`list:${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item:${itemIndex}`}>{renderInline(item, onSelectPage)}</li>
              ))}
            </List>
          );
        }

        return <p key={`paragraph:${index}`}>{renderInline(block.text, onSelectPage)}</p>;
      })}
    </div>
  );
}
