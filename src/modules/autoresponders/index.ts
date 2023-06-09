export type {
  Autoresponder,
  AutoresponderWithListAndTemplate,
  AutoresponderWithTemplate,
} from "./autoresponders.model"
export {
  handleGetAutoresponder,
  handleGetAutoresponders,
  handlePatchAutoresponder,
  handlePostAutoresponders,
} from "./autoresponders.route"
export { sendAutoresponders } from "./autoresponders.service"
