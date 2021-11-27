//! Goget v%d
//! MIT © 2021 Arthur Corenzan
//! https://github.com/corenzan/goget

/**
 * Hook function type.
 */
export type Hook<T> = (src: T) => Promise<T>;

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
 * Parameter encoder function type.
 */
export type Encoder = (value: unknown) => undefined | string;

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
 * Value mapper function type.
 */
type ValueMapper<S, R> = (value: unknown, key: keyof S, object: S) => R;

/**
 * Like Array.map but for objects.
 * @param object Source object to map.
 * @param map Value mapper function.
 * @returns New object with values remapped.
 */
const map = <S extends Record<string, unknown>, R>(
  object: S,
  map: ValueMapper<S, R>
) => {
  return Object.fromEntries(
    Object.keys(object).map((key) => {
      return [key, map(object[key], key, object)];
    })
  );
};

/**
 * Interpolate URL with given parameters.
 * @param url URL to interpolate.
 * @param params Parameters to be interpolated.
 * @returns Final string.
 */
const interpolateUrl = (
  url: string,
  params: Record<string, string | undefined>
) => {
  return url.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] ?? key;
  });
};

/**
 * Build an URL object from request descriptor.
 * @param req Request descriptor.
 * @returns URL instance.
 */
const createUrl = (req: Req) => {
  const params = map(req.params, (value) => req.encode(value));

  const url = interpolateUrl(req.url, params);
  return new URL(url);
};

/**
 * HTTP methods type.
 */
export type HttpMethod = `${
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "POST"
  | "PATCH"
  | "PUT"
  | "DELETE"}`;

/**
 * Request descriptor.
 */
export type Req = {
  url: string;
  method: HttpMethod | string;
  params: Record<string, unknown>;
  data: unknown;
  headers: Record<string, string>;
  encode: Encoder;
  reqHooks: Hook<Req>[];
  respHooks: Hook<Resp>[];
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
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  const url = createUrl(req);
  return new Request(url.toString(), init);
};

/**
 * HTTP status type.
 */
export type HttpStatus = number;

/**
 * Response descriptor.
 */
export type Resp<D = unknown> = {
  req: Req;
  status: HttpStatus;
  url: string;
  data: D;
  headers: Record<string, string>;
};

/**
 * Build a response descriptor from given Response instance and request descriptor.
 * @param resp Response instance.
 * @param req Request descriptor.
 * @returns Response descriptor.
 */
const createResp = async <D>(resp: Response, req: Req) => {
  const { headers, url, status } = resp;

  return {
    url,
    req,
    status,
    data: await resp.json(),
    headers: Object.fromEntries(headers),
  } as Resp<D>;
};

/**
 * Merge two request descriptors following a heurestic.
 * @param a Request descriptor A.
 * @param b Request descriptor B.
 * @returns Merged request descriptor.
 */
const mergeReq = (a: Req, b: Partial<Req>) => {
  const req = {
    ...a,
    ...b,
    params: { ...a.params, ...b.params },
    headers: { ...a.headers, ...b.headers },
  };
  return req;
};

/**
 * Goget instance type.
 */
type Goget = {
  defaultReq: Req;
  request: <T>(url: string, req?: Partial<Req>) => Promise<Resp<T>>;
  extend: (defaultReq: Req) => Goget;
};

/**
 * Main Goget instance.
 */
export const goget: Goget = {
  /**
   * Default request descriptor.
   */
  defaultReq: {
    method: "GET",
    url: "",
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
    const mergedReq = mergeReq(this.defaultReq, { url, ...req });
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
      defaultReq: mergeReq(this.defaultReq, defaultReq),
    };
  },
};

export default goget;
