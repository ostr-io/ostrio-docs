# Netlify Integration: Pre-rendering with ostr.io

This guide explains how to enable [ostr.io pre-rendering SEO MIddleware](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md) for sites deployed on Netlify.

<img width="1536" height="1024" alt="ostrio-prerendering-netlify-support_web" src="https://github.com/user-attachments/assets/350da2b5-40ed-45d1-a680-231a05c9916b" />

## Overview

ostr.io pre-rendering SEO Middleware delivers fully rendered HTML to search engines and modern AI crawlers, improving index coverage and discoverability while reducing origin load. The Netlify integration routes crawler traffic through ostr.io pre-rendering engine.

## Availability

* **Plans:** Available to **PRO** and **ENTERPRISE** Netlify subscriptions
* **Enablement:** Netlify must enable the integration for a site/account after receiving request with **Auth Token** (that begins with `Basic ...`)
* **SLA:** Netlify support team typically fulfills requests **within 24 hours**

> [!IMPORTANT]
> **Security note:** Treat the Auth Token as a secret. Do not share it publicly or commit it to source control.


## Prerequisites

1. An active ostr.io account
2. An active Netlify account on **PRO** or **ENTERPRISE** plans
3. A site deployed on Netlify
4. An ostr.io **Pre-rendering Auth Header/Token** issued for specific host (string that starts with `Basic ...`).


## Enablement Steps (via Netlify Support)

1. **Prepare the Auth Token**

   * Ensure the value starts with `Basic ...` (for example: `Basic dXNlcm5hbWU6c2VjcmV0`).

2. **Open a ticket with Netlify Support**

   * Subject: “Enable ostr.io pre-rendering integration”
   * Include:

     * Site domain name or site IDs on Netlify
     * The **exact** ostr.io Auth Token (the full `Basic ...` string)
     * Confirmation that ostr.io pre-rendering should be enabled for crawler traffic

3. **Wait for confirmation**

   * Netlify enables the integration and replies in the ticket/email (typically within **24 hours**).

### Example — Message to Netlify Support

```text
Subject: Enable ostr.io pre-rendering integration

Hello Netlify Support,

Please enable the ostr.io pre-rendering integration for the following Netlify site:
- Site: example-site.netlify.app (Production domain: example.com)

X-Prerender-Token: Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

This integration should route crawler traffic through ostrio's pre-rendering engine.

Thank you.
```


## Verifying the Integration

After Netlify confirms enablement: **Test with a crawler User-Agent** to confirm a fully rendered HTML response is served without requiring client-side JavaScript. Example checks:

```bash
# Simulate Googlebot; Should include X-Prerender-Id header
curl --head -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "https://example.com/"

# Simulate a standard browser (should receive standard response without X-Prerender-Id header)
curl --head -A "Mozilla/5.0" "https://www.example.com/"
```

Expected result: the response includes `X-Prerender-Id` header with server-rendered content (meta tags, structured data, critical content in source). The standard browser request remains unchanged.

> [!TIP]
> Try different tools and real crawler fetch tools (e.g., Search Console’s URL inspection). Include "escaped fragment" query at the end in tools like "page speed", for example: `https://example.com/?_escaped_fragment_=/`


## Common Issues & Fixes

* **Invalid or missing Auth Token**

  * Symptoms: crawler requests not pre-rendered or return 401/403 errors.
  * Action: generate/verify the ostr.io token and re-submit the token to Netlify Support.

* **Error: wrong domain; check auth creds**
  
  * Reason: Provided token belongs to other domain name or has a typo
  * Action: Double-check of provided Token has typos; If you have multiple domain names added to ostr.io — Ensure provided Auth/X-Prerender-Token belongs to the correct website

* **Error: domain mismatch; check auth creds**

  * Reason: Provided token belongs to TLD, but used for subdomain
  * Action: Upgrade ostr.io account to PRO or BUSINESS plans to support subdomains pre-rendering; Or add subdomain as separate pre-rendering entity

* **Site not present/verified in ostr.io**

  * Symptoms: requests rejected by the pre-rendering layer.
  * Action: add and verify the production domain in ostr.io before testing.

* **Plan limitation**

  * Symptoms: integration requests declined or integration inactive in Netlify.
  * Action: upgrade Netlify account to **PRO** or **ENTERPRISE** plans.

* **Caching delay**

  * Symptoms: inconsistent behavior immediately after enablement.
  * Action: wait for edge propagation, redeploy the site, or purge caches.

* **IP allowlists / firewall**

  * Symptoms: blocked crawler traffic through the pre-rendering layer.
  * Action: ensure any origin firewall/CDN rules allow Netlify and ostr.io traffic.


## Disable Pre-rendering integration

Open new Netlify Support ticket requesting removal of the ostr.io pre-rendering integration for the site (list site(s)).


## FAQ

* **Is this automatic?**
  * No. Netlify must enable the integration after receiving the `Basic ...` Auth Token.

* **How long does enablement take?**
  * Netlify typically completes enablement within **24 hours** of receiving the request.

* **Which requests are pre-rendered?**
  * Crawler traffic (search engines and modern AI crawlers/agents). Regular visitor traffic is unaffected.

* **Does this impact Core Web Vitals?**
  * Yes, it improves Web Vitals Scores for crawlers and bots with positive impact on crawler index, SEO scores, and organic traffic. Visitor-side Core Web Vitals remain unaffected by the crawler integration.


## Support

* **ostr.io support:** account, token, and pre-rendering configuration questions.
* **Netlify Support:** enable/disable the integration for specific sites and apply/update the Auth Token.

If additional details are needed for enterprise scenarios (multi-site enablement, staged rollouts, or custom crawler policies), contact ostr.io support with the target domains and desired policy.
