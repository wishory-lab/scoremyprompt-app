import { isFeatureEnabled, FEATURES } from '@/app/lib/features';
import PricingClient from './PricingClient';

const isBeta = isFeatureEnabled(FEATURES.BETA_MODE);

export const metadata = {
  title: isBeta
    ? 'Free Beta — ScoreMyPrompt'
    : 'Pricing — ScoreMyPrompt',
  description: isBeta
    ? 'All Pro features free during beta. 50 uses per account. Sign up now.'
    : 'Free forever, Pro $4.99/month. Unlimited scoring, Builder, and no ads.',
};

export default function PricingPage() {
  return <PricingClient />;
}
