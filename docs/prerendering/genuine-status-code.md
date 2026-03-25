# Return Genuine Status Code

Returning genuine status code is very important for indexing by search engines. Most of the front-end JavaScript frameworks returns the same page to every request with `200 OK` status code, mean `404` pages rendered in a browser is returned with `200`status to the web crawlers.

Once a website has implemented ostr.io pre-rendering integration — genuine HTTP response code (e.g. `Status` HTTP header) can be signaled via HTML markup, using one of the two available methods:

- via meta-tag
- via HTML comment

## Set Genuine Response Code via Meta Tag

To return expected response code — use the next `meta` tag, this tag __can be placed in any part of HTML-page__. `head` or `body` tag is the best place for it.

### Meta-tag Format:

__html:__

```html
<head>
  <meta name="response:status-code" content="404">
</head>
```

Use __any__ standard or custom status codes:

```html
<meta name="response:status-code" content="401">
<meta name="response:status-code" content="403">
<meta name="response:status-code" content="500">
<meta name="response:status-code" content="503">
<meta name="response:status-code" content="514"> <!-- non-standard -->
```

## Set Genuine Response Code via HTML Comment

To return expected response code — use the next HTML comment. This comment __can be placed in any part of HTML-page__. `head` or `body` tag is the best place for it.

### HTML-comment Format:

__html:__

```html
<!-- response:status-code=404 -->
```

__jade:__

```jade
// response:status-code=404
```

Use __any__ standard or custom status codes:

- `401` - `<!-- response:status-code=401 -->`
- `403` - `<!-- response:status-code=403 -->`
- `500` - `<!-- response:status-code=500 -->`
- `514` - `<!-- response:status-code=514 -->` (*non-standard*)

## Result:

![Return Genuine Status Code Screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/prerendering-genuine-status-code.png?raw=true)
