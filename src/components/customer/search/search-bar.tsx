'use client';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Search field (Search screen). Pill on bg-surface-input with a leading magnifier
// and a trailing clear-✕ that appears only when there is text. No dedicated
// "search input" primitive exists (FilledInput is a labeled form field), so this
// composes tokens + the shared <Icon> — it does not fork a primitive. The ✕ keeps
// a ≥44px hit area while staying visually small. RTL: `dir` follows the locale and
// the whole row mirrors via flow.
export function SearchBar({
  value,
  onChange,
  onSubmit,
  lang,
  t,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  lang: 'en' | 'ar';
  t: Dictionary;
  autoFocus?: boolean;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="flex min-h-tap items-center gap-2 rounded-pill bg-surface-input px-4"
    >
      <Icon name="search" className="shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.search_placeholder}
        aria-label={t.search}
        className="min-w-0 flex-1 bg-transparent py-3 text-body text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t.clear}
          className="grid min-h-tap min-w-tap shrink-0 place-items-center"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-line text-muted">
            <Icon name="close" className="h-4 w-4" aria-hidden />
          </span>
        </button>
      ) : null}
    </form>
  );
}
