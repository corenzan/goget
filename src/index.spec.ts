import fetch, { enableFetchMocks } from "jest-fetch-mock";

enableFetchMocks();

import goget from ".";

describe("goget", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // @todo Split into smaller test cases.
  test("complete request and response", async () => {
    const example = {
      resp: {
        status: 201,
        url: "http://localhost/?test=1",
        data: { id: 1, title: "Hello, world" },
        headers: {
          ["x-response-time"]: "99",
        },
      },
      req: {
        url: "http://{hostname}",
        method: "POST",
        params: { hostname: "localhost", test: 1 },
        data: { title: "Hello, world" },
        headers: {
          ["x-api-key"]: "abc123",
        },
      },
    };

    fetch.mockResponseOnce(JSON.stringify(example.resp.data), {
      url: example.resp.url,
      headers: example.resp.headers,
      status: example.resp.status,
    });

    const resp = await goget.request(example.req.url, {
      method: example.req.method,
      data: example.req.data,
      params: example.req.params,
      headers: example.req.headers,
    });

    expect(resp.req.url).toEqual(example.req.url);
    expect(resp.req.data).toEqual(example.req.data);
    expect(resp.req.params).toEqual(example.req.params);
    expect(resp.req.headers).toMatchObject(example.req.headers);
    expect(resp.headers).toMatchObject(example.resp.headers);
    expect(resp.data).toEqual(example.resp.data);
    expect(resp.url).toEqual(example.resp.url);
  });
});
