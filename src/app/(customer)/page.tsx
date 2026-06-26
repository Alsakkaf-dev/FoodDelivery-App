import Link from 'next/link';
import { getStatus } from '@/lib/domain/session';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { nowMyt } from '@/lib/utils/time';
import { Icon } from '@/components/icons';
import { StatusHero } from '@/components/customer/status-hero';
import { HomeHeader } from '@/components/customer/home/home-header';
import { SearchEntry } from '@/components/customer/home/search-entry';
import { CategoryRow, type HomeCategory } from '@/components/customer/home/category-row';

// SCR-C-01 — Customer home / discovery surface (FR-C-02/03). Public; no auth.
export const dynamic = 'force-dynamic';

function SectionHeader({ title, seeAll, href }: { title: string; seeAll: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-h2 text-ink">{title}</h2>
      <Link href={href} aria-label={seeAll} className="flex items-center gap-1 text-link text-brand">
        {seeAll}
        <Icon name="chevron-right" aria-hidden />
      </Link>
    </div>
  );
}

