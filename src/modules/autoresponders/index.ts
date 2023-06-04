export type {
  Autoresponder,
  AutoresponderWithListAndTemplates,
} from "./autoresponders.model"
export {
  handleGetAutoresponder,
  handleGetAutoresponders,
  handlePatchAutoresponder,
  handlePostAutoresponders,
} from "./autoresponders.route"
export { sendAutoresponders } from "./autoresponders.service"
