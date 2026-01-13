# Optional Services Configuration

## Overview

Sentry (error tracking) and PostHog (analytics) are now **completely optional**. The application will work perfectly without them.

---

## How It Works

### Sentry (Error Tracking)

**Status**: ✅ Optional

The application checks for `NEXT_PUBLIC_SENTRY_DSN` at runtime:
- **If present**: Sentry initializes and tracks errors
- **If missing/empty**: Application runs normally with console logging

**Modified Files**:
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

**Configuration**:
```bash
# In .env.local - leave empty to disable
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Console Output When Disabled**:
```
Sentry DSN not configured - error tracking disabled
Sentry DSN not configured - server error tracking disabled
Sentry DSN not configured - edge error tracking disabled
```

---

### PostHog (Analytics)

**Status**: ✅ Optional (already was)

The application checks for `NEXT_PUBLIC_POSTHOG_KEY` at runtime:
- **If present**: PostHog initializes and tracks events
- **If missing/empty**: Application runs normally without analytics

**Files**:
- `lib/analytics/posthog.ts` - Analytics utilities
- `components/analytics/posthog-provider.tsx` - Analytics provider

**Configuration**:
```bash
# In .env.local - leave empty to disable
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Console Output When Disabled**:
```
PostHog not configured - analytics disabled
```

---

## .env.local Configuration

### Minimal Configuration (No Optional Services)

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_PASSWORD=your-database-password

# Stripe Configuration (REQUIRED for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend) - REQUIRED for welcome emails
RESEND_API_KEY=your-resend-api-key

# Web Push (VAPID) - REQUIRED for push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com

# Error Tracking (Sentry) - OPTIONAL - Leave empty to disable
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Analytics (PostHog) - OPTIONAL - Leave empty to disable
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Full Configuration (With Optional Services)

If you want to enable Sentry and PostHog later:

```bash
# Error Tracking (Sentry) - OPTIONAL
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Analytics (PostHog) - OPTIONAL
NEXT_PUBLIC_POSTHOG_KEY=phc_your-project-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Benefits of Optional Services

### Why This Matters

1. **Faster Development Setup**
   - No need to create Sentry/PostHog accounts immediately
   - Get started with just Supabase and Stripe

2. **Reduced Costs**
   - Both services have paid tiers
   - Can defer until production deployment

3. **Simplified Testing**
   - Less noise in development
   - Cleaner console output

4. **Privacy**
   - Don't track analytics during development
   - Add when ready for production

---

## When to Enable

### Sentry (Error Tracking)

**Recommended For**:
- Production deployments
- Staging environments
- When you need detailed error reports
- When you want session replays

**Not Needed For**:
- Local development
- MVP/testing phase
- Small projects

### PostHog (Analytics)

**Recommended For**:
- Production deployments
- When tracking user behavior
- When analyzing feature usage
- When doing A/B testing

**Not Needed For**:
- Local development
- MVP/testing phase
- Privacy-focused applications

---

## How to Enable Later

### Step 1: Create Accounts

**Sentry**:
1. Go to https://sentry.io
2. Create a project
3. Get your DSN from Settings → Client Keys

**PostHog**:
1. Go to https://posthog.com
2. Create a project
3. Get your key from Settings → Project API Key

### Step 2: Add to .env.local

```bash
# Add your actual values
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/1234567
NEXT_PUBLIC_POSTHOG_KEY=phc_abcd1234efgh5678
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

### Step 4: Verify

**Sentry**:
- Check console: Should NOT see "Sentry DSN not configured"
- Trigger an error and check Sentry dashboard

**PostHog**:
- Check console: Should NOT see "PostHog not configured"
- Check PostHog dashboard for events

---

## Testing Optional Services

### Test Sentry Disabled

```bash
# 1. Ensure .env.local has empty Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=

# 2. Start dev server
npm run dev

# 3. Check console - should see:
# "Sentry DSN not configured - error tracking disabled"

# 4. Application should work normally
```

### Test PostHog Disabled

```bash
# 1. Ensure .env.local has empty PostHog key
NEXT_PUBLIC_POSTHOG_KEY=

# 2. Start dev server
npm run dev

# 3. Check console - should see:
# "PostHog not configured - analytics disabled"

# 4. Application should work normally
```

---

## Technical Implementation

### How It Works

Both services use conditional initialization:

```typescript
// Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
} else {
  console.log('Sentry DSN not configured - error tracking disabled');
}

// PostHog
if (posthogKey) {
  posthog.init(posthogKey, { api_host: posthogHost });
} else {
  console.log('PostHog not configured - analytics disabled');
}
```

### Error Handling

All analytics/tracking calls are wrapped in try-catch:

```typescript
try {
  posthog.capture(eventName, properties);
} catch (error) {
  console.warn('PostHog track failed:', error);
}
```

This ensures the app never crashes due to analytics issues.

---

## Troubleshooting

### Console Shows Warnings

**Issue**: Seeing "PostHog track failed" or similar warnings

**Solution**: This is normal when services are disabled. The warnings are harmless.

### Want to Completely Remove

If you want to remove Sentry/PostHog entirely:

1. **Uninstall packages**:
   ```bash
   npm uninstall @sentry/nextjs posthog-js
   ```

2. **Remove files**:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`
   - `lib/analytics/posthog.ts`
   - `components/analytics/posthog-provider.tsx`

3. **Remove from layout**:
   - Edit `app/layout.tsx`
   - Remove `PostHogProvider` wrapper

---

## Summary

✅ **Sentry is now optional** - Leave `NEXT_PUBLIC_SENTRY_DSN` empty to disable
✅ **PostHog is optional** - Leave `NEXT_PUBLIC_POSTHOG_KEY` empty to disable
✅ **Application works perfectly without them**
✅ **Can enable later when ready for production**

**Recommended Setup**:
- **Development**: Disabled (faster, cleaner)
- **Staging**: Enabled (test monitoring)
- **Production**: Enabled (track errors and usage)

---

**Last Updated**: January 13, 2026
