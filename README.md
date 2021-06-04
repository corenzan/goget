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
  url: "https://httpbin.org",
});

const resp = await httpbin.post("/anything", {
  data: { message: "Hello, httpbin!" },
});

console.log(resp.data);
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
