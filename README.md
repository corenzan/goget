# Goget

> Opinionated http client for the browser.

## About

- Based on web standards (Fetch, URL, etc)
- Modern browsers only
- No dependencies
- Exported types
- Conventional API, if you're familiar with Axios and the like
- Robust composability with extended instances and hooks
- Unique features like URL parametrization, parameter encoding and request merging

### At a glance

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
    }
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

//=> curl -X POST 'https://httpbin.org/anything/test?one=1' -H 'content-type: application/json' -H 'x-api-key: 123' -d '{"message":"Hello!"}'
```

### URL parametrization

...

### Parameter encoding

...

### Request merging

...

## Documentation

See ...

## Legal

The MIT License © 2021 Arthur Corenzan

```

```
