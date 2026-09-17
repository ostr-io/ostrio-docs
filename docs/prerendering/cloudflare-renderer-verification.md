# Cloudflare Renderer Verification

Prove that requests reaching your origin came from an ostr.io renderer, then allow pre-rendering traffic while blocking bot-like behavior elsewhere. The verification header removes false positives in WAF, rate limiting, and bot-fight rules.

## Contents

- [How it works](#how-it-works)
- [Managed WAF rule](#managed-waf-rule)
- [Manual WAF setup](#manual-waf-setup)
- [Rotating the secret](#rotating-the-secret)
- [Security considerations](#security-considerations)
- [Free-plan limitations](#free-plan-limitations)
- [Troubleshooting](#troubleshooting)
- [Related](#related)

## How it works

The first approved Cloudflare install creates a verification secret for that domain: 32 random bytes encoded as 43 base64url characters. Each domain gets its own. The secret is private to your account and is shown only in the pre-rendering panel.

It reaches two places:

- The managed Worker's `OSTR_VERIFY` binding, which the Worker uses to answer ostr.io's own health check.
- The renderer's private request URI, which ostr.io appends server-side.

The renderer then adds `X-Ostrio-Verify: <secret>` to every request it makes back to your site whose hostname exactly equals the hostname of the page being rendered. It is never sent to a sibling subdomain or another host, and a same-host redirect cannot carry it across origins. The boundary is the exact hostname, so a scheme or port change on that hostname still carries the header.

`X-Ostrio-Verify` is the proof that the request came from ostr.io. Match it in a Cloudflare WAF custom rule to let pre-rendering through while the rest of your bot protection stays on.

## Managed WAF rule

ostr.io creates the rule and keeps it current for you.

Cloudflare's authorization screen asks for `zone-waf.read` and `zone-waf.write` as optional permissions, ticked by default. Leave them ticked and every install of the pre-rendering Worker applies the rule on its own: created on a first install, updated on a reinstall, and re-created if you disabled it earlier. Nothing else to click.

If you untick them, or you authorized ostr.io before 2026-09-15, the install skips the rule. Add it later without reconnecting the whole integration:

1. Open your domain in the [pre-rendering panel](https://ostr.io/service/prerender).
2. In the "Renderer verification header" row, click **WAF setup**.
3. Click **Enable one-click setup**. If the authorization lacks the WAF permissions, Cloudflare asks for them first and ostr.io applies the rule when you return.

### What the rule does

- **Name:** `ostr.io verified renderer`
- **Expression:** `(http.request.headers["x-ostrio-verify"][0] eq "<verifySecret>")`
- **Action:** Skip, covering all remaining custom rules, all rate limiting rules, all Super Bot Fight Mode rules, and the legacy User Agent Blocking, Browser Integrity Check, Hotlink Protection, Security Level, Rate Limiting and Managed Rules products.
- **Not skipped:** the current Managed Rules and Zone Lockdown, deliberately, so those threats stay covered.
- **Position:** first in the custom-rule stack. Skip applies only to the rules that follow it.
- **Logging:** off.

Disconnecting the domain from Cloudflare removes the rule, and removes the ruleset too when ostr.io created it.

## Manual WAF setup

Use this if you would rather not grant the WAF permissions, or you want to own the rule yourself. The panel shows the manual instructions whenever no managed rule exists; when one does, open them with **Show manual setup**.

1. Open your domain in the [pre-rendering panel](https://ostr.io/service/prerender).
2. Click **WAF setup**.
3. Copy the **Complete Cloudflare expression** and **Verification secret** shown there.
4. In Cloudflare: Websites, your domain, Security, Security rules.
5. Click **Create rule**, then **Custom rules**.
6. Enter the rule name `ostr.io verified renderer`.
7. Click **Edit expression** and paste the expression:

   ```
   (http.request.headers["x-ostrio-verify"][0] eq "<verifySecret>")
   ```

   `<verifySecret>` is the actual secret from the panel. Preserve its uppercase and lowercase characters.
8. Choose **Skip** and select:
   - All remaining custom rules
   - All rate limiting rules
   - All Super Bot Fight Mode Rules
   - User Agent Blocking
   - Browser Integrity Check
   - Hotlink Protection
   - Security Level
   - Rate limiting rules (Previous version)
   - Managed rules (Previous version)

   Leave **All managed rules** and **Zone Lockdown** unchecked.
9. Leave **Log matching requests** off.
10. In the visual builder, enter the header key in lowercase: `x-ostrio-verify`.
11. Move the rule above any custom blocking rules.
12. Click **Deploy**.

Cloudflare's own references: [Create a custom rule](https://developers.cloudflare.com/waf/custom-rules/create-dashboard/) and [Skip action options](https://developers.cloudflare.com/waf/custom-rules/skip/options/).

## Rotating the secret

Click **Rotate key** (labelled **Rotate secret** when no managed rule exists) in the "Renderer verification header" row. One action does three things in order:

1. Generates a new secret and stores it as the source of truth.
2. Marks any managed WAF rule stale, because the deployed rule still holds the old value.
3. Pushes the new secret to the Worker binding, and only if that push reaches Cloudflare, updates the managed rule.

If the Worker push fails, the rule stays marked stale rather than accepting a proof the Worker does not hold. Once Cloudflare is reachable, click **Update WAF rule** in the same panel to reconcile it. That reapplies the current secret to the live rule without rotating the credential again.

On a manual rule, nothing updates itself. Replace the expression with the new secret immediately after rotating, or pre-rendering traffic is blocked.

## Security considerations

- Treat the verification secret as a credential. Do not publish it in screenshots, support tickets, or public documentation.
- After rotating, reconcile the WAF rule immediately: **Update WAF rule** for a managed rule, a fresh expression for a manual one.
- The header only reaches requests to the page's own hostname, so it cannot leak to a sibling subdomain through a redirect.

## Free-plan limitations

Cloudflare's **Bot Fight Mode** (free tier) cannot be skipped by a custom WAF rule. If the Security Events log shows Bot Fight Mode blocking verified renderer requests:

1. Go to Security, then Settings.
2. Filter by **Bot traffic**.
3. Turn Bot Fight Mode off, or upgrade to **Super Bot Fight Mode** (Pro/Business).

## Troubleshooting

**The panel says the rule "needs an update"**

The deployed rule holds a secret older than the current one, which happens when a rotation could not reach Cloudflare. Click **Update WAF rule**, which appears on that row whenever the rule falls behind. If the status does not clear, your Cloudflare authorization has probably expired or lost its WAF permissions: reconnect the domain, then click it again.

**After rotating, pre-rendering requests are blocked**

The WAF rule still contains the old secret. On a manual rule, paste the new expression. On a managed rule the update follows the Worker push within seconds; if the row still reads "needs an update" after a refresh, click **Update WAF rule**.

**The manual expression returns a Cloudflare syntax error**

Check that the header key is lowercase (`x-ostrio-verify`, not `X-Ostrio-Verify`). Cloudflare's expression builder treats header keys as case-sensitive even though HTTP header names are not.

## Related

- [Cloudflare Worker Integration](cloudflare-worker.md) — full setup, env vars, and error recovery
- [Pre-rendering overview](README.md) — integration matrix and platform selection
