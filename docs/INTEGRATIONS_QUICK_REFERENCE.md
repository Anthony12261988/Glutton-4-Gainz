# Integrations Quick Reference

Quick checklist and reference for all external integrations.

## Quick Setup Checklist

### Required for Basic Functionality
- [ ] **Supabase** - Database and authentication (REQUIRED)
- [ ] **Stripe** - Payment processing (REQUIRED for subscriptions)

### Optional but Recommended
- [ ] **Google OAuth** - Social login option
- [ ] **Facebook OAuth** - Social login option
- [ ] **Resend** - Email service (for welcome emails and coach invites)
- [ ] **Sentry** - Error tracking (recommended for production)
- [ ] **PostHog** - Analytics (recommended for insights)
- [ ] **VAPID Keys** - Push notifications (for user engagement)

## Environment Variables Quick List

```bash
# REQUIRED
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# OPTIONAL
RESEND_API_KEY=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Integration Status

| Integration | Status | Required | Setup Time |
|------------|--------|----------|------------|
| Supabase | ✅ Complete | Yes | 15 min |
| Stripe | ✅ Complete | Yes | 30 min |
| Google OAuth | ✅ Code Ready | No | 30-60 min |
| Facebook OAuth | ✅ Code Ready | No | 30-60 min |
| Resend Email | ✅ Complete | No | 15 min |
| Sentry | ✅ Complete | Recommended | 15 min |
| PostHog | ✅ Complete | Recommended | 15 min |
| VAPID Keys | ✅ Script Ready | No | 5 min |

## Where to Configure

1. **Supabase Dashboard**: https://app.supabase.com
   - Authentication → Providers (OAuth)
   - SQL Editor (migrations)

2. **Google Cloud Console**: https://console.cloud.google.com
   - APIs & Services → Credentials

3. **Facebook Developers**: https://developers.facebook.com
   - My Apps → Settings

4. **Stripe Dashboard**: https://dashboard.stripe.com
   - Products (create subscription)
   - Webhooks (configure endpoint)

5. **Resend Dashboard**: https://resend.com
   - API Keys
   - Domains (verify domain)

6. **Sentry Dashboard**: https://sentry.io
   - Projects → Create Project

7. **PostHog Dashboard**: https://posthog.com
   - Projects → Settings

## Common Issues

**OAuth not working?**
- Check redirect URIs match exactly
- Verify credentials in Supabase dashboard
- Check browser console for errors

**Stripe webhooks not firing?**
- Verify webhook URL is accessible
- Check webhook signing secret
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Emails not sending?**
- Verify Resend API key
- Check domain verification status
- Review Resend logs dashboard

**Analytics not tracking?**
- Check API keys in environment variables
- Verify network requests in browser console
- Check PostHog/Sentry dashboard for events

For detailed setup instructions, see [INTEGRATIONS_SETUP.md](./INTEGRATIONS_SETUP.md)
