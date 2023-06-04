/**
 * Settings stored in a database as key-value pair
 */
export const SETTINGS = {
  autoresponder_sending_status: {
    key: "autoresponder_sending_status",
    values: { idle: "idle", in_progress: "in_progress" },
  },
  newsletter_sending_status: {
    key: "newsletter_sending_status",
    values: { idle: "idle", in_progress: "in_progress" },
  },
} as const
