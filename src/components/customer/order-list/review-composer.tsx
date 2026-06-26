'use client';

import { useState } from 'react';
import { BottomSheet, RatingRow } from '@/components/ui';

// Engineer #13 — the "Rate" composer reached from a History order row.
// It captures a star rating + a short comment and shows a thank-you state.
// NOTE: there is no reviews backend yet (no table / no domain action — confirmed,
// and the domain layer is frozen to me). Submission is therefore OPTIMISTIC only:
// it does not persist. A request to add a `reviews` table + domain action is on the
// TEAM_STATUS ledger. When that lands, wire `onSubmit` to the real action here.

export type ReviewComposerLabels = {
  title: string;
  ratingLabel: string;
  reviewLabel: string;
  submit: string;
  thanks: string;
  close: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  orderNo: string;
  shopName: string;
  labels: ReviewComposerLabels;
};

