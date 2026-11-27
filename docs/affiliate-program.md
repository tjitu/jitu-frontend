# Student checkout affiliate integration

Existing shop/voucher routes now share server pricing helpers and call Main DB's
`affiliate_quote`. Preview creates no reservation. Checkout obtains an immutable
reservation, persists its Payment before contacting Midtrans, and passes snapshot
timing into gateway expiry. A Payment trigger journals verified confirmation in
the same transaction, independently of which application receives the callback.

Unassigned promotional codes continue to use their existing percentage and cap.
Packages must exist and be active; campaign pricing is applied before the referral.
Affiliate assignment, configuration, acceptance and quota are never accepted as
browser-supplied pricing inputs. Financial calculations remain on the server.

Webhook signatures are checked and gateway status is fetched before reconciliation.
Verified cumulative partial/full refund totals invoke the same idempotent ledger
function as Nest. Verified terminal failures mark reservations safe to release;
local cancellation alone does not release an uncertain boost-cap reservation.

No new student-facing app or authentication flow is introduced. Existing URLs for
voucher validation, checkout and payment status remain unchanged. See
`jitu-backend/docs/affiliate-program.md` for data definitions and deployment order.

Run `npm run test:affiliate` with Main Backend as the sibling repository. For a
worktree or custom layout, set `AFFILIATE_FIXTURE_ROOT` to its `test` directory.
The suite creates only a temporary localhost database. It tests real pricing,
campaign composition, promotion compatibility, checkout persistence and refunds
using a test gateway adapter. `node tests/payment-status.test.cjs` verifies existing
ownership, fraud and concurrent confirmation protections.

Production build was verified with `npm run build -- --webpack` in the isolated
worktree. Default Turbopack could not follow the shared dependency junction outside
that worktree root; TypeScript and the Webpack production build passed. Production
installs should use the repository's normal local dependency installation.

Apply Main DB migrations and deploy all four services before assigning affiliate
codes. No production migration, payment, refund or financial mock data was created.
