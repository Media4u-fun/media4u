/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as contactSubmissions from "../contactSubmissions.js";
import type * as emails from "../emails.js";
import type * as newsletter from "../newsletter.js";
import type * as portfolio from "../portfolio.js";
import type * as projectRequests from "../projectRequests.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as vr from "../vr.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  blog: typeof blog;
  contactSubmissions: typeof contactSubmissions;
  emails: typeof emails;
  newsletter: typeof newsletter;
  portfolio: typeof portfolio;
  projectRequests: typeof projectRequests;
  seed: typeof seed;
  settings: typeof settings;
  vr: typeof vr;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
