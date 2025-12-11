/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analysis from "../analysis.js";
import type * as body from "../body.js";
import type * as data from "../data.js";
import type * as exercises from "../exercises.js";
import type * as foodItems from "../foodItems.js";
import type * as gamification from "../gamification.js";
import type * as history from "../history.js";
import type * as icons from "../icons.js";
import type * as insights from "../insights.js";
import type * as logs from "../logs.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as routines from "../routines.js";
import type * as sports from "../sports.js";
import type * as stats from "../stats.js";
import type * as suggestions from "../suggestions.js";
import type * as userProfile from "../userProfile.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analysis: typeof analysis;
  body: typeof body;
  data: typeof data;
  exercises: typeof exercises;
  foodItems: typeof foodItems;
  gamification: typeof gamification;
  history: typeof history;
  icons: typeof icons;
  insights: typeof insights;
  logs: typeof logs;
  notifications: typeof notifications;
  reports: typeof reports;
  routines: typeof routines;
  sports: typeof sports;
  stats: typeof stats;
  suggestions: typeof suggestions;
  userProfile: typeof userProfile;
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
