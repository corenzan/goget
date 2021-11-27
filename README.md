# Goget

> Easy and flexible HTTP client for the browser.

## About

- 📃 Based on web standards (Fetch, URL, SearchParams, etc).
- 🤖 Modern browsers only.
- ⚡ No dependencies.
- 🆎 Written in TypeScript with exported types.
- 🚲 Conventional API, if you're familiar with Axios and the like.
- ⛰️ Robust composability with extended instances and hooks.
- ❄️ Unique features like interpolation, customizable encoding and request merging (see below).

### At a glance

This is an over engineered example to showcase some of the features.

```typescript
const httpbin = goget.extend({
  url: "{schema}://httpbin.{tld}",
  params: {
    tld: "org",
  },
  reqHooks: [
    async (req) => {
      req.headers["x-api-key"] = "123";
      return req;
    },
  ],
});

const anything = httpbin.extend({
  url: "/anything",
  params: {
    schema: "https",
  },
});

const resp = await anything.post("test", {
  params: {
    one: 1,
  },
  data: {
    message: "Hello!",
  },
});
```

The above request will look like this:

```
HTTP
POST /anything/test?one=1
Host: https://httpbin.org
Content-type: application/json
x-api-key: 123

{"message":"Hello!"}
```

## Features

### URL parametrization

...

### Parameter encoding

...

### Request merging

...

## Documentation

See ...

## Legal

MIT © 2021 Arthur Corenzan
