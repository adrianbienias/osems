/**
 * Settings stored in a database as key-value pair
 */
export const SETTINGS = {
  sending_status: {
    key: "sending_status",
    values: { idle: "idle", in_progress: "in_progress" },
  },
} as const
