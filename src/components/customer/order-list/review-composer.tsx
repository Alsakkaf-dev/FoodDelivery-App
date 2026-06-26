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

export function ReviewComposer({ open, onClose, orderNo, shopName, labels }: Props) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  function reset() {
    setRating(0);
    setText('');
    setDone(false);
  }

  function close() {
    onClose();
    // Reset after the sheet's close transition so the form is fresh next open.
    setTimeout(reset, 250);
  }

  function submit() {
    if (rating === 0) return;
    // Optimistic — no persistence layer exists yet (see file header).
    setDone(true);
    setTimeout(close, 1400);
  }

  return (
    <BottomSheet open={open} onClose={close} title={labels.title} closeLabel={labels.close}>
      {done ? (
        <div className="space-y-2 py-6 text-center">
          <p className="text-h2 font-bold text-success">{labels.thanks}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-caption text-muted">
            {shopName} · #{orderNo}
          </p>

          <div className="space-y-2">
            <p className="text-label uppercase text-muted">{labels.ratingLabel}</p>
            <RatingRow value={rating} onChange={setRating} />
          </div>

          <label className="block space-y-2">
            <span className="text-label uppercase text-muted">{labels.reviewLabel}</span>
            <textarea
              className="field min-h-[7rem] w-full resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </label>

          <button
            type="button"
            className="btn-primary min-h-tap w-full"
            onClick={submit}
            disabled={rating === 0}
          >
            {labels.submit}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
