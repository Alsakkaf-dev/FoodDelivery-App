import { getI18n } from '@/lib/i18n/server';
import { getStatus, configureSession } from '@/lib/domain/session';
import { listZones } from '@/lib/domain/zones';
import { ErrorState } from '@/components/ui/states';
import { SetupForm } from '@/components/operator/setup-form';
import { TZ } from '@/lib/utils/time';

// SCR-O-02 — Daily setup screen (US-026..029). Server component: pre-loads the
// current session values (`getStatus`) and ALL zones (`listZones()` — no
// activeOnly, so inactive zones are shown for toggling), then hands them to the
// client form. The operator layout owns the header chrome + BottomNav.
export const dynamic = 'force-dynamic';

