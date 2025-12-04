# Client Questions – Roles, Flows, and Permissions

Use these to confirm requirements before implementing admin/coach/user flows.

## Roles & Access
- Do we need three roles: admin, coach, user (free/premium)? Any others?
- Who should be the initial admin(s) and how are new admins created?
- Should coaches see all users or only assigned rosters?
- Can admins view/impersonate any user for support?

## Coach Onboarding
- How are coaches added: admin invite only, or self-apply + approval?
- What info is needed for a coach invite (email, name, region, certifications)?
- Should coach accounts require a special signup flow or tokenized invite link?

## User Management
- Can admins change user roles (upgrade/downgrade/coach assignment)? With audit logs?
- Should we allow bulk actions (assign coach, reset tier, lock account)?
- What happens when a coach is removed—reassign users automatically or leave unassigned?

## Content Control
- Who can create/edit workouts, rations, badges? Admins only or coaches too?
- Do we need versioning or publish/unpublish for workouts/rations?
- Can coaches personalize workouts/rations per user or only per tier?

## Billing & Upgrades
- Is premium (Soldier) only via Stripe checkout? Any coupons or trials?
- Should admins be able to comp/downgrade users manually without Stripe?
- Can coaches trigger upgrades for their users?

## Push Notifications & Messaging
- Can coaches/admins send push/messages to their roster? Any rate limits or approval?
- Do we need templates for system notifications (badges, nudges, reminders)?
- Should users be able to opt out of coach/admin communications?

## Analytics & Reporting
- What dashboards do admins need (signups, retention, revenue, engagement)?
- Do coaches need analytics limited to their roster only?

## Security & Compliance
- Any IP allowlists or 2FA required for admins/coaches?
- Should we log and surface admin actions (role changes, content edits) to an audit log?

## Support & Policies
- What support links/endpoints should exist (privacy, terms, help desk)?
- Do we need in-app support messaging or just email/links?

## Edge Cases
- How to handle suspended users (login blocked vs. read-only)?
- What should happen if a user switches coaches? Keep history or reset stats?
