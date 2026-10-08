/**
 * @/components/shared — single import point for all cross-feature UI primitives.
 *
 * Profile screens import from here; notification screens continue to import
 * from @/components/notifications (no files were moved).
 */

// ── Re-exports from the notifications component set ──────────────────────────
export { IonIcon } from '@/components/notifications/IonIcon';
export type { IonIconName, IonIconProps } from '@/components/notifications/IonIcon';

export { StatusBadge } from '@/components/notifications/StatusBadge';
export type { BadgeVariant } from '@/components/notifications/StatusBadge';

export { ToggleRow } from '@/components/notifications/ToggleRow';
export { BottomNavBar } from '@/components/notifications/BottomNavBar';
export { ScreenHeader } from '@/components/notifications/ScreenHeader';

// ── New components introduced in the profile batch ───────────────────────────
export { MenuRow } from './MenuRow';
export { SectionCard, Divider } from './SectionCard';
