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
  url: "{schema}://httpbin.org",
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
  data: {
    message: "Hello!",
  },
});

console.log(resp); //=> curl -X POST https://httpbin.org/anything/test -H 'x-api-key: 123' -d '{"message":"Hello!"}'
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
