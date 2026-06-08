export function calculateFundingBias(fundingRate: number | null): 'long_heavy' | 'short_heavy' | 'neutral' {
  if (fundingRate === null) return 'neutral';
  if (fundingRate > 0.00025) return 'long_heavy';
  if (fundingRate < -0.00025) return 'short_heavy';
  return 'neutral';
}
