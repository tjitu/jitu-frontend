export interface TokenPackage {
  id: number;
  tokenAmount: number;
  title: string;
  subtitle: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  savings: number;
  pricePerToken?: string;
  popular?: boolean;
  badge?: string;
  badgeStyle?: string;
  categoryBg: string;
}
