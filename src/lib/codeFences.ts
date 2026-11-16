export const TAB_LANGUAGES = ['cpp', 'python', 'java'] as const;

export type TabLanguage = (typeof TAB_LANGUAGES)[number];

export interface CodePane {
  language: TabLanguage;
  code: string;
}

export type ContentSegment =
  | { type: 'markdown'; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'tabs'; panes: CodePane[] };

interface LocatedFence {
  start: number;
  end: number;
  language: string;
  code: string;
}

const FENCE_PATTERN = /```([^\n]*)\r?\n([\s\S]*?)\r?\n```/g;

const LANGUAGE_ALIASES: Record<string, string> = {
  'c++': 'cpp',
  cplusplus: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  py: 'python',
};

const TAB_LANGUAGE_SET = new Set<string>(TAB_LANGUAGES);

export function isTabLanguage(value: string): value is TabLanguage {
  return TAB_LANGUAGE_SET.has(value);
}

export function normalizeLanguage(info: string): string {
  const token = info.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  return LANGUAGE_ALIASES[token] ?? token;
}

export function tabLanguageLabel(language: TabLanguage): string {
  if (language === 'cpp') return 'C++';
  if (language === 'python') return 'Python';
  return 'Java';
}

const PANE_ORDER: TabLanguage[] = [...TAB_LANGUAGES];

export function sortPanes(panes: CodePane[]): CodePane[] {
  return [...panes].sort(
    (a, b) => PANE_ORDER.indexOf(a.language) - PANE_ORDER.indexOf(b.language),
  );
}

function locateFences(markdown: string): LocatedFence[] {
  const fences: LocatedFence[] = [];

  for (const match of markdown.matchAll(FENCE_PATTERN)) {
    const start = match.index;
    if (start === undefined) {
      continue;
    }

    fences.push({
      start,
      end: start + match[0].length,
      language: normalizeLanguage(match[1] ?? ''),
      code: match[2] ?? '',
    });
  }

  return fences;
}

function onlyWhitespaceBetween(
  markdown: string,
  left: LocatedFence,
  right: LocatedFence,
): boolean {
  return markdown.slice(left.end, right.start).trim() === '';
}

/**
 * Consecutive C++/Python/Java fences become one tabbed example.
 *
 * A run stops at a repeated language or a fence that is not one of those
 * three, so two C++ samples in a row stay two samples.
 */
export function splitPostContent(markdown: string): ContentSegment[] {
  const fences = locateFences(markdown);
  if (fences.length === 0) {
    return markdown.length === 0 ? [] : [{ type: 'markdown', text: markdown }];
  }

  const segments: ContentSegment[] = [];
  let cursor = 0;
  let index = 0;

  const pushMarkdown = (text: string) => {
    if (text.length > 0) {
      segments.push({ type: 'markdown', text });
    }
  };

  while (index < fences.length) {
    const start = fences[index];
    pushMarkdown(markdown.slice(cursor, start.start));

    const group = [start];
    let next = index + 1;

    if (isTabLanguage(start.language)) {
      const seen = new Set<TabLanguage>([start.language]);

      while (next < fences.length) {
        const candidate = fences[next];
        if (!onlyWhitespaceBetween(markdown, fences[next - 1], candidate)) {
          break;
        }
        if (
          !isTabLanguage(candidate.language) ||
          seen.has(candidate.language)
        ) {
          break;
        }
        seen.add(candidate.language);
        group.push(candidate);
        next += 1;
      }
    }

    const last = group[group.length - 1];

    if (group.length >= 2) {
      segments.push({
        type: 'tabs',
        panes: sortPanes(
          group.map((fence) => ({
            language: fence.language as TabLanguage,
            code: fence.code,
          })),
        ),
      });
    } else {
      segments.push({
        type: 'code',
        language: start.language,
        code: start.code,
      });
    }

    cursor = last.end;
    index = group.length >= 2 ? next : index + 1;
  }

  pushMarkdown(markdown.slice(cursor));
  return segments;
}
