# Plans and Pricing

Choose the plan that fits your needs. Every new account starts with a **Free** plan for 30 days, followed by a 14-day grace period if you don't select a paid plan. Paid plans are charged once your domain's connection is confirmed — no separate trial period.

## Plans Overview

ostr.io offers three plan types — **Hobby**, **Pro**, and **Business** — each with a fixed feature set. Within each type, you can select a size that scales your metered volumes: ×1, ×2, ×5, ×10, or ×20.

### Plan Types

| Feature | Hobby | Pro | Business |
|---------|-------|-----|----------|
| **Monthly price (×1)** | $9 | $39 | $199 |
| Subdomains | Individual domains only | Bundled under parent domain | Bundled under parent domain |
| Load images when rendering | No | Yes | Yes |
| Cache TTL floor | 4 hours | 2 hours | No minimum |
| Crawl run limit | 500 pages per run | 2,500 pages per run | 10,000 pages per run |
| Always Green proactive updates | Not available | Every 24 hours (2 proactive slots) | Every 6 hours (4 proactive slots) |
| No-delay first request | Not available | Yes | Yes |
| Signals API / webhooks | Not available | Yes | Yes |
| WebSec check cadence | 2 times per day | 4 times per day | 6 times per day |
| Personalized invoicing | Not available | Not available | Yes |

### Metered Volumes (×1 base bundles)

Every plan type includes monthly allowances for five metered services. Sizes scale these volumes linearly.

| Volume | Free | Hobby ×1 | Pro ×1 | Business ×1 |
|--------|------|----------|---------|-------------|
| Pre-rendering (renders) | 2,000 | 5,000 | 30,000 | 150,000 |
| HTTP Monitoring checks | 1,000 | 3,000 | 4,000 | 8,500 |
| Web Analytics events | 1,000 | 2,500 | 50,000 | 200,000 |
| Web-CRON runs | 1,000 | 6,000 | 8,500 | 16,000 |
| SMS messages | 0 | 10 | 20 | 50 |

**WebSec monitoring** (Whois, DNS, TLS) is not a metered volume — it's a per-plan cadence. Every plan monitors your configured domains at a fixed frequency; you never run out.

### Size Discounts

Within a plan type, larger sizes offer stepped discounts off linear pricing:

- **×1, ×2**: Full price
- **×5**: 10% off
- **×10**: 15% off
- **×20**: 20% off

## Monthly Pricing

| Plan | ×1 | ×2 | ×5 | ×10 | ×20 |
|------|----|----|----|----- |-----|
| **Hobby** | $9 | $18 | $40 | $76 | $144 |
| **Pro** | $39 | $78 | $175 | $331 | $624 |
| **Business** | $199 | $398 | $895 | $1,691 | $3,184 |

## Annual Pricing

Save approximately 8% by paying annually. Annual plans bill at **11 months' worth of the monthly sticker**, giving you one month free.

| Plan | ×1 | ×2 | ×5 | ×10 | ×20 |
|------|----|----|----|----- |-----|
| **Hobby** | $99 | $198 | $440 | $836 | $1,584 |
| **Pro** | $429 | $858 | $1,925 | $3,641 | $6,864 |
| **Business** | $2,189 | $4,378 | $9,845 | $18,601 | $35,024 |

## Free Trial and Billing

Every new account starts with a **Free** plan for 30 days:

- 2,000 monthly renders
- 1,000 monitoring checks
- 1,000 analytics events
- 1,000 CRON runs
- 0 SMS messages
- 1 WebSec check per day

After 30 days, you enter a **14-day grace period**. During grace, your domains keep running at their existing plan level while you decide on a paid plan. After grace ends without a selection, your domains are parked: pre-rendering requests pass through directly to your origin with no rendering or caching, and other metered services skip the metered unit of work.

**You are only charged after your domain's connection is confirmed.** During the free trial and grace period, no payment is required. Once you select a paid plan, we charge only after Stripe confirms your payment method and your domain is actively connected.

## Multi-Domain and Subdomain Bundling

Every domain is metered separately, so each domain has its own monthly allowance.

**Subdomain bundling** (available on Pro and Business plans only) lets you group subdomains under a parent domain. All subdomains share the parent's single monthly allowance. On the Free and Hobby plans, each subdomain is a separate domain with its own allowance.

## Limit Hit Behavior

When a domain reaches the end of its monthly allowance for a service, what happens depends on the service:

- **Pre-rendering**: Requests pass through directly to your origin (no pre-rendering, no caching).
- **Monitoring, Analytics, CRON, SMS**: The service skips that metered unit of work until the next billing cycle.

If you need to continue service before the cycle resets, you can purchase a new plan at any time. This restarts your billing cycle with a fresh monthly allowance.

## Currency and Location

- **USD** (default): Charged in US dollars.
- **EUR**: If your billing address is in Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, Norway, Iceland, Liechtenstein, or Switzerland, you are presented with EUR pricing at the same numeric amount (€9 = $9 sticker).

The currency is locked to your first subscription or balance credit based on your billing address. A bare account without a country selection remains in USD.

## Free Tier and Legacy AppSumo Accounts

**AppSumo Lifetime Licenses**: If you purchased an ostr.io lifetime license through AppSumo, you can opt in to migrate to a frozen Lifetime plan (Lifetime Hobby or Lifetime Pro) during onboarding. Once migrated, your monthly allowance does not change when the paid-plan pricing updates and you are not charged. Accounts that have not opted in remain on the legacy pre-paid model.

**WebSec Check Frequency Note**: Customers converting from legacy Hobby/Pro plans to the new pricing model should be aware that WebSec check frequency may decrease: legacy Hobby/Pro plans included 6 checks per day, while the new Hobby plan includes 2 checks per day and the new Pro plan includes 4 checks per day. Lifetime plans retain the legacy cadence of 6 checks per day.

## Changing Plans

You can upgrade, downgrade, or change the size of your plan at any time. Plan changes take effect immediately and adjust your charges mid-cycle (adding or removing headroom) without resetting your billing cycle. A fresh billing cycle only begins after your domain exhausts its monthly allowance and you purchase a new plan to restart service.

## Related

- [Account Basics](README.md)
- [Web Analytics](../analytics/README.md)
- [Pre-rendering](../prerendering/README.md)
- [Monitoring](../monitoring/README.md)
- [Web-CRON](../web-cron/README.md)
- [WebSec](../websec/README.md)
- [Support](../SUPPORT.md)
