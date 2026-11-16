import { highlightCode } from '@/lib/highlight';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const tokens = highlightCode(code, language);
  const label = language || 'text';

  return (
    <pre className="code-block" data-language={label}>
      <code className={`code-block-code language-${label}`}>
        {tokens.map((token, index) =>
          token.kind === 'text' ? (
            token.value
          ) : (
            <span
              key={`${token.kind}-${index}`}
              className={`tok tok-${token.kind}`}
            >
              {token.value}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}
