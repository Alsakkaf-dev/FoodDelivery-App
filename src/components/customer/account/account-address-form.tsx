'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilledInput, PrimaryButton, Chip, SelectTile, EmptyState } from '@/components/ui';
import { createAddress } from '@/lib/domain/addresses';
import { addressSchema } from '@/lib/utils/schemas';
import type { Address, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { AddressMapField } from './address-map-field';
import { addressKind, type AddressKind } from './address-card';

// Add/Edit Address form (account lane — distinct from #11's checkout address
// step; both consume the frozen createAddress + addressSchema, neither edits the
// other's file). The design's ADDRESS/STREET/POST CODE/APARTMENT fields are
// presentational sub-parts composed into the schema's single `line1`; LABEL-AS
// maps to `label`; an active delivery zone supplies the required `zone_id`
// (auto-selected when there is only one). CREATE writes for real; EDIT is an
// optimistic preview (no updateAddress backend yet — see TEAM_STATUS.md).
