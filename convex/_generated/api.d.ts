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
import type * as data from "../data.js";
import type * as exercises from "../exercises.js";
import type * as foodItems from "../foodItems.js";
import type * as gamification from "../gamification.js";
import type * as icons from "../icons.js";
import type * as logs from "../logs.js";
import type * as reports from "../reports.js";
import type * as routines from "../routines.js";
import type * as sports from "../sports.js";
import type * as suggestions from "../suggestions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analysis: typeof analysis;
  data: typeof data;
  exercises: typeof exercises;
  foodItems: typeof foodItems;
  gamification: typeof gamification;
  icons: typeof icons;
  logs: typeof logs;
  reports: typeof reports;
  routines: typeof routines;
  sports: typeof sports;
  suggestions: typeof suggestions;
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
