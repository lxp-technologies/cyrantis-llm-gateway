/** Stable application identifiers shared by the inert shells and the Console. */
export const applicationIds = {
  control: 'control-api',
  gateway: 'gateway-api',
  console: 'console',
} as const;

export type ApplicationId = (typeof applicationIds)[keyof typeof applicationIds];
