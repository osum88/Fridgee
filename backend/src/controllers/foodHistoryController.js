import { getHistoryService } from "../services/foodHistoryService.js";
import handleResponse from "../utils/responseHandler.js";
import { normalizeDate } from "../utils/stringUtils.js";

// vraci historii
export const getHistory = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { limit, cursor, type, fromDate, toDate, search, changedBy } = req.query;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    let changedByFilter = undefined;

    if (changedBy) {
      if (Array.isArray(changedBy)) {
        // Převede všechna ID v poli na čísla
        changedByFilter = changedBy.map((id) => Number(id));
      } else {
        // Převede jedno ID na číslo
        changedByFilter = [Number(changedBy)];
      }
    }
    const data = {
      limit: limit ? parseInt(limit, 10) : 20,
      cursorId: cursor ? parseInt(cursor, 10) : undefined,
      type: type ? (Array.isArray(type) ? type : [type]) : undefined,
      fromDate: normalizeDate(fromDate),
      toDate: normalizeDate(toDate),
      searchString: search,
      changedBy: changedByFilter,
    };

    const history = await getHistoryService(inventoryId, data, userId, isAdmin);
    handleResponse(res, 200, "Inventory history fetched successfully", history);
  } catch (err) {
    next(err);
  }
};
