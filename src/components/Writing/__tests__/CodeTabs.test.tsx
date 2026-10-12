import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import PostContent from '../PostContent';

const TAB_SOURCE = [
  'Intro.',
  '',
  '```cpp',
  'int x = 1;',
  '```',
  '',
  '```python',
  'x = 1',
  '```',
  '',
  '```java',
  'int x = 1;',
  '```',
].join('\n');

describe('PostContent code tabs', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts on C++ and switches only after a click', () => {
    const { container } = render(<PostContent content={TAB_SOURCE} />);

    expect(screen.getByRole('tab', { name: 'C++' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      container
        .querySelector('.code-tabs-pane:not([hidden])')
        ?.getAttribute('data-language'),
    ).toBe('C++');

    fireEvent.mouseEnter(screen.getByRole('tab', { name: 'Python' }));
    expect(
      container
        .querySelector('.code-tabs-pane:not([hidden])')
        ?.getAttribute('data-language'),
    ).toBe('C++');

    fireEvent.click(screen.getByRole('tab', { name: 'Python' }));

    expect(
      container
        .querySelector('.code-tabs-pane:not([hidden])')
        ?.getAttribute('data-language'),
    ).toBe('Python');
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(window.localStorage.getItem('writing-code-lang')).toBe('python');
  });

  it('keeps every sample on the page on the same language', () => {
    const { container } = render(
      <PostContent content={`${TAB_SOURCE}\n\nBetween.\n\n${TAB_SOURCE}`} />,
    );

    const pythonTabs = screen.getAllByRole('tab', { name: 'Python' });
    expect(pythonTabs).toHaveLength(2);

    fireEvent.click(pythonTabs[0]);

    const visible = [
      ...container.querySelectorAll('.code-tabs-pane:not([hidden])'),
    ];
    expect(visible).toHaveLength(2);
    expect(
      visible.every((pane) => pane.getAttribute('data-language') === 'Python'),
    ).toBe(true);
    expect(pythonTabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps inactive panes in the document so print can restore them', () => {
    const { container } = render(<PostContent content={TAB_SOURCE} />);

    expect(container.querySelectorAll('.code-tabs-pane')).toHaveLength(3);
  });

  it('color-codes language tokens in the visible pane', () => {
    const { container } = render(<PostContent content={TAB_SOURCE} />);

    expect(
      container.querySelector('.code-tabs-pane:not([hidden]) .tok-type')
        ?.textContent,
    ).toBe('int');
    expect(
      container.querySelector('.code-tabs-pane:not([hidden]) .tok-number')
        ?.textContent,
    ).toBe('1');
  });
});
