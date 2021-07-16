/**
 * HTTP methods.
 */
export type HttpMethod =
  | "head"
  | "options"
  | "get"
  | "post"
  | "patch"
  | "put"
  | "delete";

/**
 * Hook for T.
 */
export type Hook<T> = (src: T) => Promise<T>;

/**
 * Parameter encoder.
 */
export type Encoder = (value: unknown) => undefined | string;

/**
 * Request descriptor.
 */
export type Req = {
  url: string;
  method: HttpMethod;
  params: Record<string, unknown>;
  data: unknown;
  headers: Record<string, string>;
  encode: Encoder;
  reqHooks: Hook<Req>[];
  respHooks: Hook<Resp>[];
};

/**
 * Response descriptor.
 */
export type Resp<T = unknown> = {
  req: Req;
  status: number;
  url: string;
  data: T;
  headers: Record<string, string>;
};

/**
 * Goget client.
 */
type Goget = {
  defaultReq: Req;
  request: <T>(url: string, req?: Partial<Req>) => Promise<Resp<T>>;
  extend: (defaultReq: Req) => Goget;
};

/**
 * Encode parameter value for URL.
 * @param value Paramater value.
 * @returns Encoded value or undefined.
 */
const encode = (value: unknown) => {
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return value.toString();
    case "object":
      if (Array.isArray(value) && value.length > 0) {
        return value.join();
      }
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Apply given hooks to source object and produce the promise of a final object.
 * @param src Source object.
 * @param hooks List of hooks.
 * @returns The promise of final object.
 */
const applyHooks = <T>(src: T, hooks: Hook<T>[]) => {
  return hooks.reduce(async (next, hook) => {
    return await hook(await next);
  }, Promise.resolve(src));
};

/**
 * Object mapper function.
 */
type Mapper<T> = (value: unknown, key: keyof T, object: T) => unknown;

/**
 * Like Arrya.map but for objects.
 * @param object Source object to map.
 * @param map Mapper function.
 * @returns New object with values remapped.
 */
const map = <T extends Record<string, unknown>>(object: T, map: Mapper<T>) => {
  return Object.fromEntries(
    Object.keys(object).map((key) => {
      return [key, map(object[key], key, object)];
    })
  );
};

/**
 * Build an URL object from request descriptor.
 * @param req Request descriptor.
 * @returns URL instance.
 */
const createUrl = (req: Req) => {
  const url = new URL(req.url);
  const params = map(req.params, (value) => req.encode(value));

  return url;
};

/**
 * Build a Response object from a request descriptor.
 * @param req Req object.
 * @returns Request object.
 */
const createRequest = async (req: Req) => {
  const { headers, data, method } = req;
  const init = {
    method: method.toUpperCase(),
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: data ? JSON.stringify(data) : undefined,
  };
  const url = createUrl(req);
  return new Request(url.toString(), init);
};

/**
 * Build a response descriptor from given Response instance and request descriptor.
 * @param response Response instance.
 * @param req Request descriptor.
 * @returns Response descriptor.
 */
const createResp = async <T>(response: Response, req: Req) => {
  const { headers, url, status } = response;

  return {
    url,
    req,
    status,
    data: await response.json(),
    headers: Object.fromEntries(headers),
  } as Resp<T>;
};

/**
 * Merge two given URLs using our heuristic.
 * @param baseUrl Base URL.
 * @param url Merging URL.
 * @returns Merged URL.
 */
const mergeUrl = (url: string, baseUrl: string) => {
  if (!baseUrl.startsWith("http")) {
    baseUrl = mergeUrl(baseUrl, location.toString());
  }
  if (url !== "" && !url.startsWith("/") && !baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  return baseUrl + url;
};

/**
 * Merge two request descriptors following a heurestic.
 * @param baseReq Request descriptor A.
 * @param req Request descriptor B.
 * @returns Merged request descriptor.
 */
const mergeReq = (req: Partial<Req>, baseReq: Req) => {
  const mergedReq = {
    ...baseReq,
    ...req,
    url: mergeUrl(baseReq.url, req.url ?? ""),
    params: Object.assign({}, baseReq.params, req.params),
    headers: Object.assign({}, baseReq.headers, req.headers),
    reqHooks: baseReq.reqHooks.concat(req.reqHooks ?? []),
    respHooks: baseReq.respHooks.concat(req.respHooks ?? []),
  };
  return mergedReq;
};

/**
 * Main Goget instance.
 */
const goget: Goget = {
  /**
   * Default request descriptor.
   */
  defaultReq: {
    url: "",
    method: "get",
    params: {},
    data: undefined,
    headers: {},
    encode: encode,
    reqHooks: [],
    respHooks: [],
  },

  /**
   * Make a request.
   * @param this Goget instance.
   * @param req Request descriptor.
   * @returns Response descriptor.
   */
  async request<T>(this: Goget, url: string, req: Partial<Req> = {}) {
    const mergedReq = mergeReq({ url, ...req }, this.defaultReq);
    const finalReq = await applyHooks(mergedReq, mergedReq.reqHooks);
    return await createResp<T>(
      await fetch(await createRequest(finalReq)),
      finalReq
    );
  },

  /**
   * Create new Goget instance extending existing one.
   * @param this Goget instance.
   * @param defaultReq New default request descriptor.
   * @returns New Goget instance.
   */
  extend(this: Goget, defaultReq: Req) {
    return {
      ...this,
      defaultReq: mergeReq(defaultReq, this.defaultReq),
    };
  },
};

export default goget;
