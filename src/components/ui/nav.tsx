'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// CMP-U-14 — Bottom navigation (up to 4 destinations).
export function BottomNav({ items }: { items: { href: string; label: string; icon: string }[] }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch justify-around border-t border-line bg-white">
      {items.map((it) => {
        const active = path === it.href || (it.href !== '/' && path.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex min-h-tap flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs ${active ? 'text-rust' : 'text-muted'}`}
          >
            <span className="text-lg" aria-hidden>{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
