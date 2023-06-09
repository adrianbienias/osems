export {
  getNewsletter,
  getNewsletters,
  scheduleNewsletter,
} from "./newsletters.model"
export type {
  Newsletter,
  NewsletterWithListAndTemplate,
  NewsletterWithTemplate,
} from "./newsletters.model"
export {
  handleGetNewsletter,
  handleGetNewsletters,
  handlePostNewsletter,
} from "./newsletters.route"
export { sendNewsletters } from "./newsletters.service"
