# External Integrations Setup Guide

This document provides step-by-step instructions for configuring all external integrations used in the Glutton4Gainz application.

---

## Table of Contents

1. [Supabase Configuration](#1-supabase-configuration)
2. [Google OAuth Setup](#2-google-oauth-setup)
3. [Facebook OAuth Setup](#3-facebook-oauth-setup)
4. [Stripe Payment Integration](#4-stripe-payment-integration)
5. [Resend Email Service](#5-resend-email-service)
6. [Sentry Error Tracking](#6-sentry-error-tracking)
7. [PostHog Analytics](#7-posthog-analytics)
8. [Web Push Notifications (VAPID Keys)](#8-web-push-notifications-vapid-keys)
9. [Environment Variables Summary](#9-environment-variables-summary)

---

## 1. Supabase Configuration

### Prerequisites
- Supabase account and project created
- Project URL and API keys available

### Steps

1. **Get Supabase Credentials**
   - Go to your Supabase Dashboard: https://app.supabase.com
   - Select your project
   - Navigate to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)
     - **service_role key** (starts with `eyJ...`) - Keep this secret!

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)
   ```

3. **Run Database Migrations**
   - Open Supabase Dashboard → **SQL Editor**
   - Run migrations in order (001 through 058)
   - **Important**: Run migration `058_create_notifications.sql` for payment failure notifications

4. **Storage Buckets**
   - Ensure storage buckets are configured:
     - `avatars` - User profile pictures
     - `workout-videos` - Workout video content
   - Set appropriate RLS policies for each bucket

---

## 2. Google OAuth Setup

### Prerequisites
- Google Cloud Platform account
- Access to Google Cloud Console

### Steps

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click **Create Project** or select existing project
   - Note your project name

2. **Enable Google+ API**
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API" or "Google Identity"
   - Click **Enable**

3. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - If prompted, configure OAuth consent screen first:
     - User Type: **External** (or Internal for G Suite)
     - App name: **Glutton4Gainz**
     - Support email: Your email
     - Developer contact: Your email
     - Save and continue through scopes (defaults are fine)
   - Application type: **Web application**
   - Name: **Glutton4Gainz Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback` (your Supabase project URL)
   - Click **Create**
   - **Copy the Client ID and Client Secret**

4. **Configure in Supabase**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Find **Google** and click to enable
   - Paste your **Client ID** and **Client Secret**
   - Click **Save**

5. **Test the Integration**
   - Go to your app's login page
   - Click "Sign in with Google"
   - You should be redirected to Google for authentication

---

## 3. Facebook OAuth Setup

### Prerequisites
- Facebook Developer account
- Access to Facebook Developers Console

### Steps

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click **My Apps** → **Create App**
   - Choose **Consumer** or **Business** app type
   - Fill in app details:
     - App Name: **Glutton4Gainz**
     - App Contact Email: Your email
   - Click **Create App**

2. **Add Facebook Login Product**
   - In your app dashboard, find **Add Product**
   - Click **Set Up** on **Facebook Login**
   - Choose **Web** platform
   - Enter your site URL:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`

3. **Configure OAuth Settings**
   - Go to **Settings** → **Basic**
   - Note your **App ID** and **App Secret**
   - Go to **Facebook Login** → **Settings**
   - Add Valid OAuth Redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback` (your Supabase project URL)
   - Save changes

4. **Configure in Supabase**
   - Go to Supabase Dashboard → **Authentication** → **Providers**
   - Find **Facebook** and click to enable
   - Paste your **App ID** and **App Secret**
   - Click **Save**

5. **App Review (Production Only)**
   - For production use, submit your app for review
   - Go to **App Review** → **Permissions and Features**
   - Request `email` permission (usually auto-approved)
   - Submit for review if needed

6. **Test the Integration**
   - Go to your app's login page
   - Click "Sign in with Facebook"
   - You should be redirected to Facebook for authentication

---

## 4. Stripe Payment Integration

### Prerequisites
- Stripe account (sign up at https://stripe.com)

### Steps

1. **Get Stripe API Keys**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Toggle to **Test mode** for development
   - Go to **Developers** → **API keys**
   - Copy:
     - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
     - **Secret key** (starts with `sk_test_...` or `sk_live_...`) - Click "Reveal test key"

2. **Create Subscription Product**
   - Go to **Products** → **Add product**
   - Product name: **Soldier Tier Subscription**
   - Pricing model: **Recurring**
   - Price: **$9.99 USD**
   - Billing period: **Monthly**
   - Click **Save product**
   - **Copy the Price ID** (starts with `price_...`)

3. **Configure Webhooks**
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Description: **Glutton4Gainz Payment Webhooks**
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
     - `invoice.payment_failed`
   - Click **Add endpoint**
   - **Copy the Signing secret** (starts with `whsec_...`)
   - Click **Reveal** to see the full secret

4. **Configure Environment Variables**
   ```bash
   STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID=price_...
   ```

5. **Test the Integration**
   - Use Stripe test cards: https://stripe.com/docs/testing
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date and CVC
   - Go to your app's pricing page and test checkout

6. **Production Setup**
   - Switch to **Live mode** in Stripe Dashboard
   - Create production product and price
   - Update environment variables with live keys
   - Update webhook endpoint URL to production domain
   - Test with real payment method (small amount)

---

## 5. Resend Email Service

### Prerequisites
- Resend account (sign up at https://resend.com)

### Steps

1. **Create Resend Account**
   - Go to [Resend](https://resend.com)
   - Sign up for free account
   - Verify your email

2. **Get API Key**
   - Go to **API Keys** in Resend dashboard
   - Click **Create API Key**
   - Name: **Glutton4Gainz Production** (or Development)
   - Permission: **Full Access** (or **Sending Access**)
   - Click **Create**
   - **Copy the API key** (starts with `re_...`)
   - ⚠️ **Save it immediately** - you won't see it again

3. **Verify Domain (Production)**
   - Go to **Domains** in Resend dashboard
   - Click **Add Domain**
   - Enter your domain: `glutton4gainz.com`
   - Add DNS records to your domain:
     - SPF record
     - DKIM records (multiple)
     - DMARC record (optional but recommended)
   - Wait for verification (can take up to 48 hours)
   - Once verified, you can send from `noreply@glutton4gainz.com`

4. **Development Setup**
   - For development, you can use Resend's test domain
   - Or use your verified domain in both environments

5. **Configure Environment Variables**
   ```bash
   RESEND_API_KEY=re_...
   ```

6. **Test Email Sending**
   - The app will automatically send:
     - Welcome emails on signup
     - Coach invitation emails
   - Check Resend dashboard → **Logs** to see sent emails

---

## 6. Sentry Error Tracking

### Prerequisites
- Sentry account (sign up at https://sentry.io)

### Steps

1. **Create Sentry Account**
   - Go to [Sentry](https://sentry.io/signup/)
   - Sign up for free account
   - Create a new organization (or use existing)

2. **Create Project**
   - Click **Create Project**
   - Platform: **Next.js**
   - Project name: **Glutton4Gainz**
   - Team: Select or create a team
   - Click **Create Project**

3. **Get DSN (Data Source Name)**
   - After project creation, Sentry shows setup instructions
   - **Copy the DSN** (starts with `https://...@...`)
   - It looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

4. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

5. **Configure Sentry (Optional)**
   - Go to **Settings** → **Projects** → **Glutton4Gainz**
   - Configure:
     - **Release Tracking** (optional)
     - **Source Maps** (for better error details)
     - **Performance Monitoring** (optional)
     - **Session Replay** (already configured in code)

6. **Test Error Tracking**
   - The app automatically tracks errors in:
     - `app/error.tsx` - Application errors
     - `app/global-error.tsx` - Critical errors
     - `components/error/error-boundary.tsx` - React component errors
   - Trigger a test error to verify it appears in Sentry dashboard

7. **Set Up Alerts (Optional)**
   - Go to **Alerts** → **Create Alert Rule**
   - Configure when to notify you (e.g., error rate threshold)
   - Add notification channels (email, Slack, etc.)

---

## 7. PostHog Analytics

### Prerequisites
- PostHog account (sign up at https://posthog.com)

### Steps

1. **Create PostHog Account**
   - Go to [PostHog](https://posthog.com/signup)
   - Sign up for free account (self-hosted or cloud)
   - Create a new project: **Glutton4Gainz**

2. **Get Project API Key**
   - After project creation, go to **Project Settings**
   - Find **Project API Key**
   - **Copy the key** (looks like `phc_...`)

3. **Get PostHog Host**
   - For PostHog Cloud: `https://us.i.posthog.com` (US) or `https://eu.i.posthog.com` (EU)
   - For self-hosted: Your PostHog instance URL
   - Default is `https://us.i.posthog.com`

4. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

5. **Configure PostHog Settings (Optional)**
   - Go to **Project Settings** → **Feature Flags** (if using)
   - Configure **Session Replay** settings
   - Set up **Data Retention** policies
   - Configure **GDPR Compliance** if needed

6. **Test Analytics**
   - The app automatically tracks:
     - Page views
     - User identification (on login)
     - User properties (role, tier, XP, streak)
   - Check PostHog dashboard → **Events** to see tracked events
   - Use `trackEvent()` function in code to track custom events

7. **Set Up Dashboards (Optional)**
   - Create custom dashboards for key metrics
   - Set up insights and funnels
   - Configure retention analysis

---

## 8. Web Push Notifications (VAPID Keys)

### Prerequisites
- Node.js installed
- `web-push` package (already in dependencies)

### Steps

1. **Generate VAPID Keys**
   - Open terminal in project root
   - Run: `npm run generate-vapid-keys`
   - This will output:
     ```
     NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
     VAPID_PRIVATE_KEY=...
     ```

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BF... (long base64 string)
   VAPID_PRIVATE_KEY=... (long base64 string - keep secret!)
   ```

3. **Verify Service Worker**
   - Ensure `ServiceWorkerRegister` component is in `app/layout.tsx` (already added)
   - Service worker should be in `public/sw.js` or similar
   - Check browser console for service worker registration

4. **Test Push Notifications**
   - User must grant notification permission
   - Subscribe to push notifications in the app
   - Send a test notification via the app
   - Check browser notifications

5. **Production Considerations**
   - VAPID keys work for both development and production
   - No need to regenerate for production
   - Ensure HTTPS in production (required for push notifications)

---

## 9. Environment Variables Summary

Create a `.env.local` file in the project root with all required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Resend Email
RESEND_API_KEY=re_...

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BF...
VAPID_PRIVATE_KEY=...

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com (or http://localhost:3000 for dev)
```

### Environment Variable Security

- **Never commit `.env.local` to version control**
- Add `.env.local` to `.gitignore` (should already be there)
- Use different keys for development and production
- Rotate keys periodically for security
- Use environment variable management in your hosting platform:
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site Settings → Environment Variables
  - Other platforms: Check their documentation

---

## Verification Checklist

After completing all setups, verify each integration:

- [ ] **Supabase**: Can create user accounts and query database
- [ ] **Google OAuth**: Can sign in with Google account
- [ ] **Facebook OAuth**: Can sign in with Facebook account
- [ ] **Stripe**: Can create checkout session and process test payment
- [ ] **Stripe Webhooks**: Webhook events are received and processed
- [ ] **Resend**: Welcome email is sent on user signup
- [ ] **Sentry**: Test error appears in Sentry dashboard
- [ ] **PostHog**: Page views and user events appear in PostHog
- [ ] **Push Notifications**: Can subscribe and receive test notification

---

## Troubleshooting

### OAuth Issues
- **Redirect URI mismatch**: Ensure redirect URI in provider matches Supabase callback URL exactly
- **App not verified**: For production, complete app verification process
- **Scope issues**: Ensure required scopes (email, profile) are requested

### Stripe Issues
- **Webhook not receiving events**: Check webhook endpoint URL and signing secret
- **Payment not processing**: Verify price ID and API keys are correct
- **Test mode vs Live mode**: Ensure using correct keys for environment

### Email Issues
- **Emails not sending**: Check Resend API key and domain verification status
- **Emails going to spam**: Verify SPF, DKIM, and DMARC records
- **Rate limits**: Check Resend dashboard for rate limit information

### Analytics/Error Tracking Issues
- **Events not appearing**: Check API keys and network requests in browser console
- **User not identified**: Ensure user is logged in when identify is called
- **Sentry not capturing errors**: Verify DSN is correct and Sentry is initialized

### Push Notification Issues
- **Permission denied**: User must grant notification permission
- **Subscription failed**: Check VAPID keys are correct
- **Notifications not received**: Verify service worker is registered and active

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Resend Docs**: https://resend.com/docs
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **PostHog Docs**: https://posthog.com/docs
- **Web Push API**: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

## Additional Notes

1. **Development vs Production**
   - Use test/sandbox keys for development
   - Switch to production keys before deploying
   - Update redirect URIs and webhook URLs for production

2. **Cost Considerations**
   - Most services have free tiers
   - Monitor usage to avoid unexpected charges
   - Set up billing alerts where available

3. **Security Best Practices**
   - Never expose private keys in client-side code
   - Use environment variables for all secrets
   - Rotate keys periodically
   - Use least-privilege access where possible

4. **Backup and Recovery**
   - Document all API keys in secure password manager
   - Keep backup of environment variables
   - Document configuration changes

---

**Last Updated**: January 2025  
**Maintained By**: Development Team
