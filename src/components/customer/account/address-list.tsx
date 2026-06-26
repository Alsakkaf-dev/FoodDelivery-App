'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton, BottomSheet, EmptyState, TextAction } from '@/components/ui';
import type { Address, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { AddressCard, addressKind } from './address-card';
import { AccountAddressForm } from './account-address-form';

// My Address — the saved-address book. Reads are real (listAddresses, passed in
// as `initial`); the only real WRITE in this lane is "Add new address" (its own
// route → createAddress). Edit opens the address form in a BottomSheet and Delete
// removes optimistically with an Undo affordance — both are preview-only because
// there is no updateAddress/deleteAddress server action yet (see TEAM_STATUS.md).
