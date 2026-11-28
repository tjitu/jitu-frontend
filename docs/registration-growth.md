# Student registration growth

Dashboard, catalog and tryout detail share the existing registration modal. Enabled free registration shows the social checklist and normalized Instagram username, then a pending outcome. Required inputs control the submit button; a request guard plus server idempotency prevents duplicates. Session-scoped form storage survives external tabs and reopening. External links use new tabs with `noopener noreferrer`.

Pending/rejected states do not confer access. Buttons reflect verification status; the detail banner and open outcome poll status every ten seconds while visible and show in-app approval/rejection notifications. Rejected users can correct and resubmit while registration remains open. Parent caches refresh when the completed modal closes so the community invitation remains visible.

The compact outcome uses the actual tryout name. Story warnings appear only when Story sharing is required. Prize and community blocks are independently configurable; no prize/winner wording appears when prizes are off. Community membership remains optional. Manual verification disabled produces immediate registration success without claiming verified Instagram engagement.

## Routes and deployment

- `POST /api/proxy/tryout/[id]/register`: authenticated existing registration/payment transaction with shared PostgreSQL growth submission/paid reconciliation.
- `GET /api/proxy/tryout/[id]/growth`: current own status/configuration, private preview exemption, current actual solution price; no-store.
- `POST /api/proxy/tryout/[id]/growth/events`: authenticated bounded client telemetry.
- Catalog/detail/dashboard routes expose only the current user's verification status; usernames are not added to public listings.

Deploy the four Main DB `20261128*` growth migrations from `jitu-backend` first, then both APIs and frontends. Use existing server-side database/auth configuration. No new browser secret or Instagram integration is required. Configure campaigns in Team Control Center → tryout create/edit → **Registration & Growth**. Existing tryouts default off; enabled forms load persisted settings dynamically.

## Validation

`npm run test:growth`: 7 tests against real Next route handlers plus isolated localhost PostgreSQL and 6 modal/normalization render tests. Adjacent `jitu-backend/test/growth-fixture.cjs` supplies the fixture; override `GROWTH_FIXTURE_ROOT` when testing separate checkouts. `GROWTH_TEST_DATABASE_URL` accepts only localhost and tests clean up their databases. Production build passes. Existing result-count tests (7) and payment-status regression also pass.

An isolated Chromium run exercised real shared RegisterModal/hook, actual Next handlers, actual Team admin service/components and PostgreSQL. It passed rejection/resubmission/approval polling, no pending attempt, independent admin checks, partial save, Save & Next, required reason, external-tab/form preservation, double-click submit, 375×667 participant layout, 390×844 Team dark layout, keyboard/Escape, and auto-success with optional Story/no prize. Real Supabase sessions were substituted only inside that harness; shared accounts were not created or changed.

Instagram verification remains manual. Existing outbound registration notifications were unavailable; status updates use polling/Sonner while relevant UI is open. Community analytics measures clicks, not membership. Browser storage/telemetry failure never grants access or blocks server enforcement. See `registration-growth-files.md` for modified files and backend documentation for migrations/security/metrics.
