'use client';
import {
  useEffect, useId, useRef, useState,
  type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Form inputs. Token-driven, ≥44px tap, RTL via logical props (label
// text-start, trailing affordance pinned to `end-0`). All copy is caller-supplied;
// the only inline strings are English fallbacks for the password-reveal aria-label
// (overridable), matching the existing ErrorState fallback pattern.

const FIELD =
  'w-full min-h-tap rounded-md bg-surface-input px-4 py-3.5 text-body text-ink placeholder:text-muted outline-none transition focus:ring-2 focus:ring-brand/30';

type FilledInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  trailingIcon?: IconName;
  multiline?: boolean;
  rows?: number;
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

/** FilledInput — gray filled field, uppercase label above, optional trailing icon /
 *  password eye-toggle, and a `multiline` textarea variant. */
