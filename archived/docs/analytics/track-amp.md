# Track AMP pages

[AMP project](https://www.ampproject.org/) aims to speed up and enhance the user experience, and it's open source! API and markup are minimal and strict, and not easy to find a way to track and build analytics from views of AMP-powered pages.

Below we suggest using custom events of ostr.io web analytics to track views on Accelerated Mobile Pages (AMP) within `amp-img` tag:

```html
<!doctype html>
<html lang="en" itemscope itemtype="http://schema.org/WebPage" ⚡>
  <head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <link rel="canonical" itemprop="url" href="https://example.com/full/version/of/web-page">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

    <title>Title</title>

    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  </head>
  <body>
    <article id="about" itemscope itemtype="http://schema.org/Article" >
      <header>
        <h1 itemprop="name">Title</h1>
        <h2 itemprop="headline">Headline, sub-title</h2>
      </header>
      <main role="main">
        <p>....Main Text Here....</p>
      </main>
    </article>

    <!-- TODO: replace {{TRACKING_ID}} with actual tracking ID -->
    <!-- TODO: replace {{PAGE_ID}} with actual unique page ID -->
    <amp-img
      src="https://analytics.ostr.io/{{TRACKING_ID}}.gif?3={%22amp%22:%22{{PAGE_ID}}%22}&9=786589&v=220"
      width="1"
      height="1"
      layout="fixed"
      alt="analytics"
      title="analytics"
    ></amp-img>
  </body>
</html>
```

As alternative (*or addition*) to track a visit only, without reporting to custom events use following snippet:

```html
<!doctype html>
<html ⚡>
  <head>
    <!-- ...Head markup here, see above... -->
  </head>
  <body>
    <!-- ...Body markup here, see above... -->

    <!-- TODO: replace {{TRACKING_ID}} with actual tracking ID -->
    <!-- TODO: replace {{amp-my-page-title}} with page title, recommended to start with `amp-*` -->
    <amp-img
      src="https://analytics.ostr.io/{{TRACKING_ID}}.gif?2={{amp-my-page-title}}&9=3556787&v=220"
      width="1"
      height="1"
      layout="fixed"
      alt="analytics"
      title="analytics"
    ></amp-img>
  </body>
</html>
```

Track page visit and track event when visitor reach end of the AMP page:

```html
<!doctype html>
<html ⚡>
  <head>
    <!-- ...Head markup here, see above... -->
  </head>
  <body>
    <!-- Place event-tracking code before main AMP content to track page opening -->
    <!-- TODO: replace {{TRACKING_ID}} with actual tracking ID -->
    <!-- TODO: replace {{PAGE_ID}} with page title, recommended to start with `amp-*` -->
    <amp-img
      src="https://analytics.ostr.io/{{TRACKING_ID}}.gif?3={%22amp-start%22:%22{{PAGE_ID}}%22}&9=908568&v=220"
      width="1"
      height="1"
      layout="fixed"
      alt="analytics"
      title="analytics"
    ></amp-img>

    <!-- ...Body markup here, see above... -->

    <!-- Place event-tracking code after main AMP content to track reaching end of the page: -->
    <amp-img
      src="https://analytics.ostr.io/{{TRACKING_ID}}.gif?3={%22amp-end%22:%22{{PAGE_ID}}%22}&9=896458&v=220"
      width="1"
      height="1"
      layout="fixed"
      alt="analytics"
      title="analytics"
    ></amp-img>
  </body>
</html>
```

## Further reading:

- [web-analytics docs](https://github.com/veliovgroup/ostrio-analytics#analytics-for-ostrio)
