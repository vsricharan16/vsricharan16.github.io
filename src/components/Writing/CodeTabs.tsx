'use client';

import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type CodePane,
  isTabLanguage,
  type TabLanguage,
  tabLanguageLabel,
} from '@/lib/codeFences';

import CodeBlock from './CodeBlock';

const STORAGE_KEY = 'writing-code-lang';

interface CodeLangContextValue {
  language: TabLanguage;
  setLanguage: (language: TabLanguage) => void;
}

const CodeLangContext = createContext<CodeLangContextValue | null>(null);

export function CodeLangProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<TabLanguage>('cpp');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && isTabLanguage(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((next: TabLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return (
    <CodeLangContext.Provider value={value}>
      {children}
    </CodeLangContext.Provider>
  );
}

function useCodeLang(): CodeLangContextValue {
  const value = useContext(CodeLangContext);
  if (!value) {
    throw new Error('CodeTabs must render inside CodeLangProvider');
  }
  return value;
}

interface CodeTabsProps {
  panes: CodePane[];
}

export default function CodeTabs({ panes }: CodeTabsProps) {
  const { language, setLanguage } = useCodeLang();
  const baseId = useId();
  const tabRefs = useRef<
    Partial<Record<TabLanguage, HTMLButtonElement | null>>
  >({});
  const active = panes.find((pane) => pane.language === language) ?? panes[0];

  const selectPane = useCallback(
    (next: TabLanguage) => {
      setLanguage(next);
    },
    [setLanguage],
  );

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextPane = panes[(index + offset + panes.length) % panes.length];
    if (!nextPane) {
      return;
    }
    selectPane(nextPane.language);
    queueMicrotask(() => tabRefs.current[nextPane.language]?.focus());
  };

  if (!active) {
    return null;
  }

  return (
    <div className="code-tabs">
      <div className="code-tabs-toolbar" role="tablist" aria-label="Language">
        {panes.map((pane, index) => {
          const selected = pane.language === active.language;
          const tabId = `${baseId}-tab-${pane.language}`;
          const panelId = `${baseId}-panel-${pane.language}`;

          return (
            <button
              key={pane.language}
              ref={(node) => {
                tabRefs.current[pane.language] = node;
              }}
              type="button"
              role="tab"
              id={tabId}
              className="code-tabs-tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectPane(pane.language)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {tabLanguageLabel(pane.language)}
            </button>
          );
        })}
      </div>
      {panes.map((pane) => {
        const selected = pane.language === active.language;

        return (
          <div
            key={pane.language}
            className="code-tabs-pane"
            role="tabpanel"
            id={`${baseId}-panel-${pane.language}`}
            aria-labelledby={`${baseId}-tab-${pane.language}`}
            data-language={tabLanguageLabel(pane.language)}
            hidden={!selected}
          >
            <CodeBlock language={pane.language} code={pane.code} />
          </div>
        );
      })}
    </div>
  );
}
