export interface PremiumUserFields {
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
}

/**
 * Single source of truth for checking whether a user's Premium status is active.
 */
export function isUserPremiumActive(
  user?: PremiumUserFields | null,
  now: Date = new Date(),
): boolean {
  if (!user?.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  const expiresAt =
    user.premiumExpiresAt instanceof Date
      ? user.premiumExpiresAt
      : new Date(user.premiumExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return false;
  return expiresAt > now;
}
