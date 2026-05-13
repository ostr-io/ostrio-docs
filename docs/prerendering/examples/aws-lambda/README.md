# AWS Lambda@Edge examples

Drop-in AWS CloudFront edge pair that routes crawler traffic to the [ostr.io](https://ostr.io) pre-rendering CDN. The CloudFront Function classifies requests before cache lookup; the Lambda@Edge origin-request function rewrites matching cache misses to `render.ostr.io`.

> For the integration guide with context, prerequisites, and alternatives see [`../../aws-lambda.md`](../../aws-lambda.md).

## Contents

- [What it does](#what-it-does)
- [Why two functions](#why-two-functions)
- [File layout](#file-layout)
- [Setup](#setup)
- [Validation](#validation)
- [How it works](#how-it-works)
- [Related](#related)

## What it does

| Request | Behavior |
| --- | --- |
| Human visitor | Stays on the configured CloudFront origin |
| Known crawler / social preview / AI fetcher | Rewrites the origin request to `render.ostr.io` |
| Non-`GET`/`HEAD`, `/.well-known/`, static-asset extension | Skipped |
| Missing `X-Ostr-Auth` secret | Falls back to the configured origin |

## Why two functions

CloudFront origin-request Lambda@Edge functions execute only on cache misses. A single origin-request Lambda can miss crawler traffic when a human version is already cached. The companion CloudFront Function runs at viewer-request time and adds `X-Ostr-Prerender: 1` or `0` before CloudFront builds the cache key, so crawler and visitor HTML use separate cache variants.

CloudFront Functions cannot make network requests, so they cannot call the renderer directly. Lambda@Edge viewer-request functions can generate responses, but AWS limits generated viewer-request responses to 40 KB. Rewriting the origin request avoids that response-size ceiling and lets `render.ostr.io` return the full HTML snapshot.

## File layout

```text
aws-lambda/
  cloudfront-viewer-request.js      <-- CloudFront Function, viewer-request
  lambda-edge-origin-request.js     <-- Lambda@Edge, origin-request
```

## Setup

### 1. Add the CloudFront Function

1. Create a CloudFront Function with JavaScript runtime 2.0.
2. Paste [`cloudfront-viewer-request.js`](cloudfront-viewer-request.js).
3. Publish it.
4. Associate it with the cache behavior as **Viewer request**.

### 2. Add cache and origin request policies

Create or update the cache behavior:

- Cache policy: include the `X-Ostr-Prerender` header in the cache key.
- Query strings: include all query strings, or at least every query parameter your public pages use plus `_escaped_fragment_`.
- Origin request policy: forward `X-Ostr-Prerender` and `X-Ostr-User-Agent` to the origin request Lambda.

Do not cache on the raw `User-Agent` header. CloudFront has many user-agent values, and AWS recommends avoiding `User-Agent` in the cache key because it fragments the cache.

### 3. Add the Lambda@Edge function

1. Create a Node.js Lambda function in `us-east-1`.
2. Paste [`lambda-edge-origin-request.js`](lambda-edge-origin-request.js).
3. Publish a numbered version.
4. Associate that version with the same cache behavior as **Origin request**.

Lambda@Edge requires a published function version; aliases and `$LATEST` are not valid for CloudFront associations.

### 4. Add `OSTR_AUTH`

Lambda@Edge does not support custom environment variables. Recommended secret path:

1. Open the CloudFront distribution origin settings.
2. Add an origin custom header:

   ```text
   X-Ostr-Auth: Basic <base64 user:password>
   ```

3. Deploy the distribution.

The Lambda reads `X-Ostr-Auth` from `request.origin.*.customHeaders`, removes it, and only sends it to `render.ostr.io`. Visitor requests do not receive that header at the origin.

Alternative: inject `BASIC_TOKEN` during CI before publishing the Lambda version. Do not commit a real token.

## Validation

Bot request should return a pre-rendered snapshot:

```shell
curl -sI -A 'Googlebot/2.1' https://example.com/
# Look for x-prerender-id in the response headers.
```

Regular browser request should stay on the origin:

```shell
curl -sI -A 'Mozilla/5.0' https://example.com/
```

Legacy fragment request should hit the renderer:

```shell
curl -sI 'https://example.com/?_escaped_fragment_='
```

In CloudFront logs, crawler cache misses should use `render.ostr.io` as the dynamic origin. Human cache misses should use the original origin.

## How it works

- [`cloudfront-viewer-request.js`](cloudfront-viewer-request.js) checks method, path, static extension, `_escaped_fragment_`, and the [canonical crawler User-Agent regex](../../shared/crawler-ua-regex.md). It sets `X-Ostr-Prerender` to `1` or `0`, and copies the original viewer UA to `X-Ostr-User-Agent` for crawler requests.
- [`lambda-edge-origin-request.js`](lambda-edge-origin-request.js) rechecks the same guards, builds the renderer URL from `Host`, `uri`, and `querystring`, strips `_escaped_fragment_`, and rewrites matching requests to `https://render.ostr.io/?url=...&bot=...`.
- Static assets use the [canonical static-extension regex](../../shared/static-extensions-regex.md).
- Common non-page paths (`/api/`, `/admin/`, `/auth/`, `/robots.txt`, `sitemap*.xml`, health endpoints) stay on origin. Adjust `IGNORED_PATHS_RE` for your app.

## Related

- [AWS Lambda@Edge integration guide](../../aws-lambda.md)
- [Cloudflare Worker integration](../../cloudflare-worker.md)
- [Rendering endpoints](../../rendering-endpoints.md)
- [Detect pre-rendering engine requests at runtime](../../detect-prerendering.md)
- [AWS Lambda@Edge restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-edge-function-restrictions.html)
- [AWS CloudFront Function restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-function-restrictions.html)
- [AWS Lambda@Edge generated response limits](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-generating-http-responses.html)
