'use client';

import dynamic from 'next/dynamic';
import { isFeatureEnabled, FEATURES } from '@/app/lib/features';

const AdBanner = dynamic(() => import('./AdBanner'), { ssr: false });

/**
 * Standardized ad slot.
 * - Placement controls the AdBanner variant + responsive layout.
 * - Returns null entirely for Pro users or when ADS flag is off.
 * - Preserves conversion-critical surfaces (home hero, builder preview) ad-free.
 */
export type AdSlotPlacement =
  | 'ResultInline'    // Mid-scroll on result pages
  | 'ResultBottom'    // Below result, pre-share
  | 'FooterSticky';   // Mobile sticky footer

interface AdSlotProps {
  placement: AdSlotPlacement;
  isPro?: boolean;
  className?: string;
}

export default function AdSlot({ placement, isPro = false, className = '' }: AdSlotProps) {
  if (isPro) return null;
  if (!isFeatureEnabled(FEATURES.ADS)) return null;

  const bannerSlot = placement === 'ResultInline' || placement === 'FooterSticky'
    ? 'leaderboard'
    : 'rectangle';

  const wrapperClass =
    placement === 'FooterSticky'
      ? 'fixed bottom-0 left-0 right-0 z-40 md:hidden bg-dark/90 border-t border-border p-2'
      : `my-6 flex justify-center ${className}`;

  return (
    <div data-ad-slot={placement} className={wrapperClass}>
      <AdBanner slot={bannerSlot} isPro={isPro} />
    </div>
  );
}
