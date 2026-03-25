# SEO Middleware Worker for Shopify

Step-by-step ostr.io pre-rendering integration instructions for Shopify domains via CloudFlare Workers

## ToC

- 🌤️ [Setup domain name at CloudFlare](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#setup-domain-name-at-cloudflare)
- ▲ [Setup domain name at ostr.io](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#setup-domain-name-at-ostrio)
- 🔌 [Create CloudFlare Worker and Connect to Domain](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-cloudflare-worker-and-connect-to-domain)
- 🔧 [Check that setup is correctly configured and working](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#check-that-setup-is-correctly-configured-and-working)
  - 🖥️ [Check via Browser](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#via-browser)
  - 👨‍💻 [Check in Terminal/Console using `curl`](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#via-terminalconsole-using-curl)

![ostrio-shopify-cloudflare](https://github.com/user-attachments/assets/9c32a8ac-d3d9-4df1-b3cc-0eb61857c4bb)

### Setup domain name at CloudFlare

To begin Shopify pre-rendering integration via CloudFlare ensure you have an active account and connected domain name.

> [!important]
> If domain purchased through Shopify (Shopify-managed) — *Shopify doesn't let edit the nameservers (NS).*
> In this case you will need to transfer the domain out to a provider that lets you set NS (CloudFlare, Namecheap, GoDaddy, etc.).
>
> 1. Read [Shopify instruction to obtain __transfer code__](https://help.shopify.com/en/manual/domains/managing-domain-ownership/transferring-shopify-domains#transfer-domain-provider) — Settings > Domains > Domain settings (*dropdown*) > Transfer to another provider
> 2. Read how to [transferd domain to CloudFlare](https://developers.cloudflare.com/registrar/get-started/transfer-domain-to-cloudflare/)
>
> If you're able to change NS records within your registrar — *Follow steps below to create CloudFlare account*

1. [Sign up](https://dash.cloudflare.com/sign-up) or [Login](https://dash.cloudflare.com/login) to CloudFlare
2. __Add domain:__ "Account Home" > click on <kbd>Onboard a domain</kbd>
3. Go through on-boarding steps, under "__Block AI training bots__" section select "__Do not block (off)__" option
4. __Setup DNS:__ Ensure `A` and `CNAME` records correctly pointing to Shopify:
    - __a.__ For shops on `www.` and other subdomains (e.g. `www.example.com` or `shop.example.com`):
        - `A`: `23.227.38.65` (__*with Orange Cloud enabled*__)
        - `CNAME`: `shops.myshopify.com` (__*with Orange Cloud enabled*__)
    - __b.__ For shops on TLD/primary domain (e.g. `example.com`):
       - `CNAME`: `shops.myshopify.com` (__*with Orange Cloud enabled*__)
       - __NOTE: NO `A` RECORD NEEDED FOR TLD DOMAIN__

<table><tbody><tr><td>
<p>Option (a.) for shops on subdomians (<code>A</code> and <code>CNAME</code> records)</p>
<img width="1513" height="814" alt="shopify-subdomain" src="https://github.com/user-attachments/assets/8c8519b9-7fd9-4f93-893f-2416a8c7b444" />
</td><td>
<p>Option (b.) for shops on TLD (only one <code>CNAME</code> record)</p>
<img width="1513" height="814" alt="shopify-tld" src="https://github.com/user-attachments/assets/1fc5f873-4469-42b9-b165-db744e0ceef8" />  
</td></tr><tr><td colspan="2">
  <p>Shopify domain settings</p>
  <img width="1557" height="858" alt="shopify-domain-settings" src="https://github.com/user-attachments/assets/85564d84-14e0-4e46-8543-2ada48dcfc39" />
</td></tr></tbody></table>

### Setup domain name at ostr.io

Create a new account if you don't have one yet. Then add and verify your domain ownership.

1. [Sign up](https://ostr.io/signup) or [Login](https://ostr.io/login) to ostr.io
2. Add server/domain following on-boarding guidance
3. Verify domain ownership using `DNS TXT` record adding via CloudFlare interface
4. Inside server's panel under "Available Services" section click on <kbd>add</kbd> next to "Pre-rendering"
5. Inside server's pre-rendering panel scroll down to <kbd>integration guide</kbd>
6. In the <kbd>CLOUDFLARE</kbd> tab — grab `env.OSTR_AUTH` value for CloudFlare's Worker environment variable

### Create CloudFlare Worker and Connect to Domain

1. Go to "Account Home" in the sidebar
2. __In the sidebar:__ Compute (Workers) > Workers & Pages (*see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-new-worker-from-step-2)*)
3. At __Workers & Pages__ page click on <kbd>Create</kbd> > Then select "Start with Hello World!" (*see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-new-worker-from-hello-world-template-from-step-3)*)
4. __New Worker Form__: Enter memorable name (ex.: `examplecom-seo-worker`) > click on <kbd>Deploy</kbd> (*see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-new-worker-deploy-hello-world-worker-from-step-4)*)
5. After __new Worker__ created > click on <kbd>Edit Code</kbd> (*see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-new-worker-edit-hello-world-worker-from-step-5)*)
6. At __Worker Editor__ > Remove default "Hello World" worker code and replace with [CloudFlare Worker Code tailored for Shopify](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/examples/cloudflare-worker/shopify.clouflare.worker.js)
7. After Worker's code placed into __Worker Editor__ > click on <kbd>Deploy</kbd> (*see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#create-new-worker-paste-and-deploy-workers-code-from-step-7)*)
8. __Pass API key to CloudFlare Worker via environment variable__ (*see [UI screenshots](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#add-api-key-from-step-8)*)
    - Go to "Workers & Pages" > Open Newly Created Worker > Settings > Variables and Secrets > Click on <kbd>Add</kbd> button:
        - Type: `text`
        - Variable Name: `OSTR_AUTH`
        - Value: Place value (*from "integration guide", see step no.6*) that starts with `Basic ...`
    - Click on <kbd>Deploy</kbd> after adding `OSTR_AUTH` variable
9. __Connect Worker to a website__ (*see [UI screenshots](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#connect-worker-to-a-website-from-step-9)*)
    - Go to "Account Home" > Domains > (*click on your domain name*)
    - In sidebar open "__Workers Routes__" > HTTP Routes > click on <kbd>Add Route</kbd>
    - __Add Route__: `https://example.com/*` or `https://subdomain.example.com/*` (*if `www.` or other subdomain is your primary website location; __Should match primary domain settings in Shopify; Must include `/*` (slash and asterisk) at the end of route__*)
    - __Worker:__ Select newly created worker from dropdown
    - Click on <kbd>save</kbd>
10. __Purge cache at CloudFlare__ (see [UI screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#purge-websites-cache-from-step-10))
    - Go to "Account Home" in the sidebar menu
    - (*click on your domain name*) > Caching > Configuration > <kbd>Purge Everything</kbd>

#### Create new Worker (*from step 2*)

Open "Workers & Pages" and click on <kbd>Create</kbd> button to initiate new CloudFlare worker
<img width="1557" height="858" alt="create-worker-step-1" src="https://github.com/user-attachments/assets/a380746a-41d3-47bb-b70e-709ff20f97c1" />

#### Create new Worker from "Hello World" template (*from step 3*)

Choose "Start with Hello World!" and click <kbd>Get Started</kbd>
<img width="1557" height="858" alt="create-worker-step-2" src="https://github.com/user-attachments/assets/cb46cc34-b404-481a-8504-3ad42ef63157" />

#### Create new Worker: Deploy "Hello World" worker (*from step 4*)

Enter Worker's name and click on <kbd>Deploy</kbd>
<img width="1513" height="814" alt="create-worker-step-3" src="https://github.com/user-attachments/assets/81fb66a5-dc76-4b20-9fff-72b4a7e4e5cb" />

#### Create new Worker: Edit "Hello World" worker (*from step 5*)

Click on <kbd>Edit code</kbd> to start editing default "Hello World!" worker's code
<img width="1513" height="814" alt="create-worker-step-4" src="https://github.com/user-attachments/assets/d4f693cb-ef7e-49fa-93a1-7454619a87c3" />

#### Create new Worker: Paste and deploy worker's code (*from step 7*)

In editor paste [pre-rendering worker's code tailored for Shopify](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/examples/cloudflare-worker/shopify.clouflare.worker.js) and click on <kbd>Deploy</kbd> then click on the name of the worker to go back
<img width="1557" height="858" alt="create-worker-step-5" src="https://github.com/user-attachments/assets/3b19c1d5-be24-4fb9-85b2-6e027f6bfd87" />

#### Add API Key (*from step 8*)

Go back to "Workers & Pages" > Open recently created Worker > Settings > Variables and Secrets > Click on <kbd>Add</kbd>
<img width="1557" height="858" alt="create-worker_add-api-key_1" src="https://github.com/user-attachments/assets/0bad5669-0613-4220-ab94-46c0cea255c8" />

Create `OSTR_AUTH` variable, paste API key that starts with `Basic xxx...` (*as found in ["integration guide" at ostr.io](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#setup-domain-name-at-ostrio)*)
<img width="1557" height="858" alt="create-worker_add-api-key_2" src="https://github.com/user-attachments/assets/14d335eb-895c-47eb-8ad0-ee0107c1c1eb" />

#### Connect Worker to a website (*from step 9*)

Go back to "Account Home" > Domains > Open shop's domain
<img width="1557" height="858" alt="create-worker-step-6" src="https://github.com/user-attachments/assets/47eed9af-3173-4033-bd98-30c62d0d071d" />

Open "Workers Routes" in sidebar > Click on <kbd>Add Route</kbd>
<img width="1557" height="858" alt="create-worker-step-7" src="https://github.com/user-attachments/assets/a7246c95-281c-42c5-bd60-f6590d6d2872" />

Add route entering shop's domain name (*see step 8 above for more details*)
<img width="1557" height="858" alt="create-worker-step-8" src="https://github.com/user-attachments/assets/5fb62ff6-4af3-41b0-8198-10b9faf3dea0" />

#### Purge website's cache (*from step 10*)

Go back to "Account Home" > Open Shop's domain > Caching > Configuration > <kbd>Purge Everything</kbd>
<img width="1557" height="858" alt="create-worker-step-9" src="https://github.com/user-attachments/assets/141cc154-49ca-4350-9ca0-36cba5160922" />

### Check that setup is correctly configured and working

Check that `X-Prerender-Id` exists in response headers

#### Via Browser

1. Open DevTools
    - Windows: <kbd>F12</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
    - MacOS: <kbd>Option</kbd> + <kbd>⌘</kbd> + <kbd>I</kbd>
2. __In DevTools:__ Open "Network" tab and check "Disable Cache" checkbox
3. Open shop URL adding `?_escaped_fragment_=` query at the end. Ex.: `https://example.com/?_escaped_fragment_=/`
4. Ensure `X-Prerender-Id` header returned with response
5. Check ostr.io: Rendering statistics will appear in real-time

<img width="2056" height="906" alt="create-worker-step-10_check-browser" src="https://github.com/user-attachments/assets/7fb06a95-7f4c-4afb-bb51-8a8789c3940d" />

#### Via Terminal/Console using CURL

1. Request using cURL: `curl --head -A GoogleBot "https://example.com/"`
2. Ensure `X-Prerender-Id` header returned with response
3. Check ostr.io: Rendering statistics will appear in real-time

## Further reading

- 🏎️ [Speed-up rendering](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/optimization.md#speed-up-rendering)
- 🤖 [Detect requests from pre-rendering](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering.md)
- 📔 [Detailed Pre-rendering service documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md)
