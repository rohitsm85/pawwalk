# PawWalk

Booking app for a dog-walking business. Clients pick a half-hour slot and
book it; the admin (business owner) approves or rejects from a private
panel; both sides get email notifications, and approved bookings include
a calendar (.ics) invite.

## Stack

- Frontend: React 19 + Vite 8, inline styles (no CSS framework), hosted on
  Vercel, trunk-based auto-deploy from `main` on push to
  `github.com/rohitsm85/pawwalk`.
- Backend: Firebase project `pawwalk-2da30` — Firestore (region
  `australia-southeast1`), Firebase Auth, Cloud Functions v2 (Node 24).
- Email: Gmail SMTP via `nodemailer`, credentials stored as Secret Manager
  secrets (`GMAIL_USER`, `GMAIL_APP_PASSWORD` — a Gmail App Password, not
  the account login password).

## Routes (all served by the same SPA, routed by `pathname` in `src/App.jsx`)

- `/` — `src/Home.jsx`, marketing/landing page (services, how-it-works, CTA).
- `/book` — `src/BookingForm.jsx`, the booking flow.
- `/admin` — `src/AdminPanel.jsx`, Google Sign-In gated approve/reject panel.

`vercel.json` has a catch-all rewrite to `index.html` so direct links to
`/book` and `/admin` don't 404.

## Auth model

- All visitors get anonymous Firebase Auth on page load (`useAuth.js`) —
  needed to write to `walks` under Firestore rules, no login required for
  clients.
- Admin access requires **Google Sign-In** where the signed-in email
  matches `VITE_ADMIN_EMAIL` (Vercel env var) and `email_verified` is
  true (checked both client-side in `useAdminAuth.js` and server-side in
  `firestore.rules`'s `isAdmin()`). Currently the admin email is
  `rohitsm85@gmail.com` (the developer's own account) — swapping this to
  the business owner's email is a pending decision, see below.

## Data model

- `walks/{walkId}` — one doc per booking. Fields: `userId`, `ownerName`,
  `dogName`, `email`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `notes?`,
  `status` (`pending → approved | rejected`, or `pending|approved →
  cancelled` by the original booker), `createdAt`. Contains PII, so reads
  are restricted to the owner (`request.auth.uid == userId`) or the admin.
- `bookedSlots/{date_time}` — denormalized, **no PII**, written only by
  the `onWalkWritten` Cloud Function via the Admin SDK (no client write
  rule exists for this collection). Used to grey out taken slots for any
  authenticated visitor without exposing whose booking it is.

Full rules + field-level validation live in `firestore.rules` (validator
function pattern — `isValidNewWalk()`, `isValidStatusTransition()`,
`isValidOwnerCancellation()`).

## Cloud Function — `functions/src/index.ts`

Single `onWalkWritten` trigger (`onDocumentWritten` on `walks/{walkId}`)
does all of the following on every write:
1. Syncs `bookedSlots` (creates on pending/approved, deletes on
   rejected/cancelled).
2. New booking (`!before && after.status === 'pending'`) → email the
   admin with an approve/reject link to `/admin`.
3. Client cancels (`before.status !== 'cancelled' → after.status ===
   'cancelled'`) → email the admin.
4. Admin approves/rejects (`before.status !== after.status`, new status
   `approved`/`rejected`) → email the client; approvals attach a
   generated `.ics` calendar file (`buildIcs()`).

`setGlobalOptions({ region: "australia-southeast1" })` matters — it must
match the Firestore database region or the Eventarc trigger fails to
provision.

## Business logic (currently hardcoded, see "replication" below)

Time slots in `getTimeSlots()` (`BookingForm.jsx`): weekdays 17:00–20:00,
weekends 09:00–18:00, half-hour increments. Past slots for today are
filtered client-side and re-checked server-side (`isInThePast()` in
`useBooking.js`) so a stale tab can't book an elapsed time.

## Local development

Two terminals, both required (the app auto-connects to emulators in dev
mode via `src/firebase.js`, gated on `import.meta.env.DEV`):

```
# Terminal 1 — Firebase emulators (Auth :9099, Firestore :8080, UI :4000)
npx firebase emulators:start --only auth,firestore

# Terminal 2 — Vite dev server, fixed to port 5175
npm run dev
```

Port 5175 is pinned in `vite.config.js` specifically to avoid clashing
with the sibling `lyrics_hudku` project, which uses Vite's default 5173.

`functions/` has its own lint/build: `npm run lint`, `npm run build`
(`tsc`). ESLint uses a flat config (`functions/eslint.config.mjs`,
`typescript-eslint`) scoped to `src/**/*.ts` only.

## Deploying

- **Frontend**: `git push origin main` → Vercel auto-deploys (trunk-based,
  already connected). No manual `vercel --prod` needed unless testing a
  preview.
- **Backend**: `npx firebase deploy --only firestore:rules,functions`
  from the repo root. Requires `GMAIL_USER`/`GMAIL_APP_PASSWORD` secrets
  to already be set (`firebase functions:secrets:set <NAME>`).

## Known gotchas

- Firestore region and Cloud Functions region must match
  (`australia-southeast1`) or Eventarc trigger creation fails.
- First-ever 2nd-gen function deploy can fail once on IAM propagation
  delay — retry after a couple of minutes; verify with
  `firebase functions:list` rather than trusting a CLI timeout message,
  since the deploy can succeed server-side even when the CLI reports a
  timeout.
- `firebase functions:artifacts:setpolicy` looks in `us-central1` by
  default and won't find the `australia-southeast1` repository — harmless
  CLI quirk, ignore the warning about container image cleanup cost.
- Don't put real secret values in commands run through an agent/assistant
  session — use `firebase functions:secrets:set` interactively instead,
  since command output can end up in transcripts.

## Open / pending decisions

- **Admin identity swap**: `rohitsm85@gmail.com` is currently used as all
  three of (a) the Google account that logs into `/admin`, (b) the
  notification recipient for new bookings/cancellations, and (c) the
  Gmail account sending all emails. The business owner (not the
  developer) should probably own (a) and (b); (c) can stay as-is since
  changing the sender needs a new Gmail App Password from whoever owns
  that inbox.
- **Replicating this for other businesses** — see discussion in project
  history; no work started yet. The blocker is that business name,
  services copy, time-slot hours, and the admin email are all hardcoded
  rather than config-driven.
