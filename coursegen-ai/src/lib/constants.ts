/** Free course generations granted to every new account. */
// Must stay in sync with the `credits` default in prisma/schema.prisma.
export const FREE_CREDITS = 10;

/** Minimum number of units a course must have before it can be generated. */
export const MIN_UNITS = 3;

/** Upper bound on units, to keep a single generation inside the function timeout. */
export const MAX_UNITS = 8;

/** Shown on course cards when Unsplash is not configured or returns nothing. */
export const PLACEHOLDER_COURSE_IMAGE = "/placeholder-course.svg";
