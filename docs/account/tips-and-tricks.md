# Tips and Tricks

ostr.io usage tips and tricks

## ⌨️ Key bindings and shortcuts

- Pagination: Arrow keys <kbd>←</kbd> and <kbd>→</kbd> (*works on every page and modals with pagination*);
- Activate Search: <kbd>ctrl</kbd>+<kbd>f</kbd> (<kbd>⌘</kbd>+<kbd>f</kbd> on MacOS);
- Start Searching: <kbd>return</kbd> (<kbd>⏎</kbd>) key;
- Cancel Search: <kbd>esc</kbd> key.

## 🤑 Free credits

- Create an account using [this special link](https://ostr.io/signup/gCZWjiBScePWrnnDr) to get $50 off your second purchase;
- Invite friends! Obtain [unique referral link](https://ostr.io/account#ref) and share it with your friends or colleagues to earn free credits;
- Subscribe on our social accounts ([Twitter](https://twitter.com/ostrio_service), [Facebook](https://www.facebook.com/ostrio.service), [Instagram](https://www.instagram.com/ostr.io/), [Medium](https://medium.com/@ostr.io)) where we post promo-codes;
- Subscribe on our newsletter in [account settings](https://ostr.io/account).

## 🤖 Pre-rendering Tips

- Pass `/sitemap.xml` to <kbd>Pre-Render</kbd> (*Pre-render a website*) in __Pre-rendering Panel__ to instantly render whole website;
- Use [alternative *rendering endpoint*](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md) to reach best performance results.

### Running pre-rendering integration tests:

- Use `cURL` and `Authorization` header (*see nginx integration*): `curl -v -H "Authorization: Basic TOKEN" https://render.ostr.io/?url=https://your-website-domain.com`;
- Use `cURL` and authentication credentials (*see node.js integration*): `curl -v https://auth:string@render-bypass.ostr.io/?url=https://your-website-domain.com`;
- Use `test:test` credentials to test general integration (*to make sure web application server can reach pre-rendering service*);
- Use `Authorization: Basic dGVzdDp0ZXN0` header to test general integration (*to make sure web application server can reach pre-rendering service*);
- Learn more about running tests in [`spiderable-middleware` package documentation](https://github.com/veliovgroup/spiderable-middleware#running-tests).

## 📈 Web Analytics Tips

- Enable "Development Mode" to test web analytics integration and data-reports right from `localhost`.

## 🔭 Monitoring Tips

- Use `{{rand}}` placeholder (*including curly brackets*) in endpoint URL to generate unique random URI for every checking request. Note: `{{rand}}` can be used multiple times in a single URL, example: `/path/{{rand}}/part?nc={{rand}}`.

## ⏰ Web-CRON Tips

- Use `{{rand}}` placeholder (*including curly brackets*) in endpoint URL to generate unique random URI for every CRON request. Note: `{{rand}}` can be used multiple times in a single URL, example: `/path/{{rand}}/part?nc={{rand}}`.
