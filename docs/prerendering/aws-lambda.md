# AWS Lambda@Edge Integration

AWS Lambda@Edge can add ostr.io pre-rendering in front of any public site already served through Amazon CloudFront. Use it when CloudFront is the CDN layer you control and Cloudflare Workers, Vercel middleware, or a reverse proxy are not the right fit.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- [Complete AWS examples](examples/aws-lambda/)
- Canonical regex sources - [Crawler User-Agent](shared/crawler-ua-regex.md), [Static-asset extensions](shared/static-extensions-regex.md)

## Contents

- [How it works](#how-it-works)
- [When to use](#when-to-use)
- [Quick start](#quick-start)
- [Operational notes](#operational-notes)
- [Cache behavior](#cache-behavior)
- [Validation](#validation)
- [Common issues](#common-issues)
- [Related](#related)

## How it works

AWS splits the Cloudflare Worker-style middleware into two edge pieces:

1. **CloudFront Function, viewer-request** - runs before cache lookup, detects crawler traffic with the canonical regex, and adds `X-Ostr-Prerender: 1` or `0`.
2. **Lambda@Edge, origin-request** - runs on cache misses, reads `X-Ostr-Prerender`, and rewrites matching HTML requests to `https://render.ostr.io/?url=...&bot=...`.

This shape avoids caching on raw `User-Agent`, avoids Lambda-generated response body limits, and keeps visitor traffic on the original CloudFront origin.

## When to use

- The website is already behind Amazon CloudFront.
- You can edit the distribution behavior, cache policy, origin request policy, and origin custom headers.
- You want CDN-level pre-rendering without changing the origin app.
- You need one integration that works across S3, ALB, API Gateway, EC2, ECS, or any custom HTTPS origin behind CloudFront.

Do not use this integration when you can deploy a simpler platform-native middleware at the HTML layer. Prefer [Cloudflare Worker](cloudflare-worker.md), [Vercel](vercel-prerendering.md), [Nginx](nginx.md), [Apache](apache.md), [Caddy](caddy-prerendering.md), [Next.js](nextjs-prerendering.md), or [Node.js](node-npm.md) when those layers are already controlled by the project.

## Quick start

1. Add and verify the production domain in the [ostr.io pre-rendering panel](https://ostr.io/service/prerender); copy the `Basic ...` token.
2. Copy [`examples/aws-lambda/cloudfront-viewer-request.js`](examples/aws-lambda/cloudfront-viewer-request.js) into a CloudFront Function, publish it, and associate it with the cache behavior as **Viewer request**.
3. Configure the cache behavior policies:
   - **Cache policy** — include header `X-Ostr-Prerender` in the cache key. Include all query strings (or at least every public query parameter plus `_escaped_fragment_`).
   - **Origin request policy** — forward both `X-Ostr-Prerender` and `X-Ostr-User-Agent` to origin, and forward query strings consistent with the cache policy.
   - Do **not** put raw `User-Agent` in the cache key. AWS recommends against it because UA values fragment the cache; this integration uses a low-cardinality `X-Ostr-Prerender: 0|1` instead.
4. Add origin custom header `X-Ostr-Auth: Basic <token>` to the CloudFront origin. Lambda@Edge does not support custom environment variables, so this is the recommended secret path.
5. Create the Lambda execution role with a trust policy for **both** Lambda and Lambda@Edge:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": { "Service": ["lambda.amazonaws.com", "edgelambda.amazonaws.com"] },
       "Action": "sts:AssumeRole"
     }]
   }
   ```

   Attach `AWSLambdaBasicExecutionRole` for CloudWatch Logs. No additional permissions are required.
6. Copy [`examples/aws-lambda/lambda-edge-origin-request.js`](examples/aws-lambda/lambda-edge-origin-request.js) into a Node.js Lambda function in `us-east-1` using the role above.
7. Publish a numbered Lambda version and associate that version with the cache behavior as **Origin request**.
8. Deploy the distribution and run [Validation](#validation).

See [`examples/aws-lambda/`](examples/aws-lambda/) for file-level setup and behavior details.

### Operational notes

- **Logs spread across regions** — Lambda@Edge writes to CloudWatch Logs in the region nearest each viewer, not `us-east-1`. Default retention is "Never expire". Set retention (e.g. 7 days) on the `/aws/lambda/us-east-1.<function-name>` log group in every region the distribution serves, or apply it programmatically.
- **Tests** — the example Lambda exports private helpers for unit testing. Run `node --test examples/aws-lambda/` from the docs tree.

## Cache behavior

CloudFront origin-request Lambda@Edge runs only when CloudFront sends a request to origin. If a page is already in edge cache, the origin-request Lambda does not execute. The viewer-request CloudFront Function solves this by adding a low-cardinality `X-Ostr-Prerender` cache-key header before cache lookup:

| Header | Cache variant |
| --- | --- |
| `X-Ostr-Prerender: 0` | Human / normal HTML |
| `X-Ostr-Prerender: 1` | Crawler / rendered HTML |

Do not put raw `User-Agent` in the cache key. AWS documents that `User-Agent` has many possible values and can fragment the cache. The example copies the original viewer UA into `X-Ostr-User-Agent` only for Lambda routing and renderer analytics.

## Validation

After deploying, invalidate the CloudFront cache so the first test request does not hit a pre-integration cached response:

```shell
aws cloudfront create-invalidation --distribution-id <id> --paths '/*'
```

Bot request should return a pre-rendered snapshot with `X-Prerender-Id`:

```shell
curl -sI -A 'Googlebot/2.1' https://example.com/
```

Regular browser request should not include `X-Prerender-Id`:

```shell
curl -sI -A 'Mozilla/5.0' https://example.com/
```

Legacy fragment request should hit the renderer:

```shell
curl -sI 'https://example.com/?_escaped_fragment_='
```

Direct renderer smoke test:

```shell
curl -v -H "Authorization: Basic dGVzdDp0ZXN0" "https://render-bypass.ostr.io/?url=https://example.com"
```

## Common issues

- **Bot gets human HTML** - `X-Ostr-Prerender` is not in the cache key, the CloudFront Function is not associated with viewer-request, or CloudFront cache was not invalidated after deployment.
- **Lambda never runs** - origin-request Lambda@Edge only runs on cache misses. Invalidate the URL or wait for TTL expiry.
- **Renderer returns `401` / `403`** - `X-Ostr-Auth` is missing from origin custom headers or the copied token is not the `Basic ...` value from ostr.io.
- **Lambda deploy fails** - Lambda@Edge functions must be created in `us-east-1`, published as numbered versions, and associated by version ARN rather than `$LATEST` or alias.
- **Query parameters disappear** - cache and origin request policies are not forwarding query strings. Include all query strings unless the site has a tighter documented list.
- **Origin receives `X-Ostr-Auth`** - keep the cleanup block in `lambda-edge-origin-request.js`; it removes the origin custom header before visitor pass-through.
- **Every crawler request misses cache** - raw `User-Agent` is in the cache key. Use `X-Ostr-Prerender` instead.

## Related

- [AWS Lambda@Edge examples](examples/aws-lambda/)
- [Cloudflare Worker integration](cloudflare-worker.md)
- [Vercel integration](vercel-prerendering.md)
- [Nginx integration](nginx.md)
- [Rendering endpoints](rendering-endpoints.md)
- [AWS Lambda@Edge restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-edge-function-restrictions.html)
- [AWS Lambda@Edge event associations](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_LambdaFunctionAssociation.html)
- [AWS CloudFront Functions restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-function-restrictions.html)
- [AWS Lambda@Edge generated response limits](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-generating-http-responses.html)
- [AWS origin request policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html)
- [AWS origin custom headers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html)
