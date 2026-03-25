# Pinterest Rich Pins basics

## About:

__Description by Pinterest:__
> Rich Pins show metadata right on the Pin itself, giving Pinners a richer experience and increasing engagement. Information in a Rich Pin is independent of the Pin description, ensuring that important information is always tied to the Pin. There are 4 types of Rich Pins: app, article, product and recipe Pins.
>
> Rich Pins work by displaying metadata from marked up pages on your website. Once you've applied for Rich Pins, any content on your site with metadata will turn into a Rich Pin when a user saves it.

Needs to be mentioned: ["Structured Data"](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/website/social-networking/structured-data-basics.md) and [Open Graph](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/website/social-networking/open-graph-basics.md) is supported by Pinterest too, basically Pinterest Rich Pins is based on combination of Open Graph and "Structured Data" with some extra tags extension `article:`.

## Basic structure:

This example is very basic usage, but will cover most of the cases. For more info and examples - *see links below*.

```html
<html itemscope itemtype="http://schema.org/WebPage" prefix="og: http://ogp.me/ns#">
  <head>
    <!-- standard meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Traveler: Norway</title>

    <!-- common linked content -->
    <link rel="image" href="https://example.com/social-1280x640.png">
    <link rel="canonical" href="https://example.com/articles/norway">

    <!-- structured meta tags -->
    <meta name="description" itemprop="description" content="Awesome articles about travel in Norway">
    <meta name="image" itemprop="image" content="https://example.com/social-1280x640.png">
    <meta name="keywords" itemprop="keywords" content="awesome, travel, article, Norway, blog">
    <meta name="name" itemprop="name" content="Traveler">
    <meta name="url" itemprop="url" content="https://example.com/articles/norway">

    <!-- open graph tags -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Traveler">
    <meta property="og:description" content="Awesome articles about travel in Norway">
    <meta property="og:image" content="https://example.com/social-1280x640.png">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="640">
    <meta property="og:locale" content="en_US">
    <meta property="og:title" content="Traveler: Norway">
    <meta property="og:url" content="https://example.com/articles/norway">

    <!-- pinterest open graph tags -->
    <meta property="article:published_time" content="2020-03-22T08:00:00+00:00">
    <meta property="article:author" content="YOUR_NAME">
    <meta property="article:tag" content="awesome, travel, article, Norway, blog">
  </head>
  <body>
    <!-- Content -->
  </body>
</html>
```

## Further reading:

- [Instructions by Pinterest](https://help.pinterest.com/en/articles/enable-rich-pins-your-site)
- [Pinterest Pins Validator](https://developers.pinterest.com/tools/url-debugger/)
- [Docs by Pinterest](https://developers.pinterest.com/docs/rich-pins/articles/)
- [Specs by Pinterest](https://developers.pinterest.com/docs/rich-pins/reference/)
