import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

export const MarkdownContent = ({ content }: MarkdownContentProps) => (
  <div className="prose prose-neutral max-w-none text-foreground dark:prose-invert prose-pre:rounded-lg prose-pre:border prose-pre:border-border">
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {content}
    </ReactMarkdown>
  </div>
);
