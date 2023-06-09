export {
  addList,
  getList,
  getListWithContacts,
  getLists,
  getListsByIds,
  updateList,
} from "./lists.model"
export type { List, ListWithCount } from "./lists.model"
export {
  handleGetList,
  handleGetLists,
  handlePatchList,
  handlePostList,
} from "./lists.route"
