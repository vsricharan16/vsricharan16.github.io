'use client';

import Markdown from 'markdown-to-jsx';
import Image from 'next/image';
import { Fragment } from 'react';

import MarkdownLink from '@/components/MarkdownLink';
import { splitPostContent } from '@/lib/codeFences';

import CodeBlock from './CodeBlock';
import CodeTabs, { CodeLangProvider } from './CodeTabs';

interface PostContentProps {
  content: string;
  /**
   * Intrinsic dimensions per image src, measured at build time by the page.
   * Every image previously declared 1200x630 regardless of its real shape, so
   * each one reserved the wrong ratio and shifted the page as it loaded.
   */
  imageSizes?: Record<string, { width: number; height: number }>;
}

/** Remote/data images cannot be inspected from the repository at build time. */
const FALLBACK_SIZE = { width: 1200, height: 675 };

function isRootLocalImage(src: string): boolean {
  return src.startsWith('/') && !src.startsWith('//');
}

function MarkdownChunk({
  content,
  imageSizes,
}: {
  content: string;
  imageSizes: Record<string, { width: number; height: number }>;
}) {
  return (
    <Markdown
      options={{
        wrapper: Fragment,
        overrides: {
          a: { component: MarkdownLink },
          img: {
            component: ({ alt, src }: { alt?: string; src?: string }) => {
              if (!src) {
                return null;
              }

              const measuredSize = imageSizes[src];
              if (isRootLocalImage(src) && !measuredSize) {
                throw new Error(
                  `Missing measured dimensions for local article image: ${src}`,
                );
              }
              const { width, height } = measuredSize ?? FALLBACK_SIZE;

              return (
                <Image
                  src={src}
                  alt={alt || ''}
                  width={width}
                  height={height}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              );
            },
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
}

export default function PostContent({
  content,
  imageSizes = {},
}: PostContentProps) {
  const segments = splitPostContent(content);

  return (
    <CodeLangProvider>
      {segments.map((segment, index) => {
        if (segment.type === 'markdown') {
          return (
            <MarkdownChunk
              key={`markdown-${index}`}
              content={segment.text}
              imageSizes={imageSizes}
            />
          );
        }

        if (segment.type === 'tabs') {
          return <CodeTabs key={`tabs-${index}`} panes={segment.panes} />;
        }

        return (
          <CodeBlock
            key={`code-${index}`}
            language={segment.language}
            code={segment.code}
          />
        );
      })}
    </CodeLangProvider>
  );
}
