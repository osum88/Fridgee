import { getHistoryService } from "../services/foodHistoryService.js";
import handleResponse from "../utils/responseHandler.js";
import { normalizeDate } from "../utils/stringUtils.js";

// vraci historii
export const getHistory = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { limit, cursor, type, fromDate, toDate, search } = req.query;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const types = type ? (Array.isArray(type) ? type : [type]) : undefined;

    const data = {
      limit: limit ? parseInt(limit, 10) : 20,
      cursorId: cursor ? parseInt(cursor, 10) : undefined,
      type: types,
      fromDate: normalizeDate(fromDate),
      toDate: normalizeDate(toDate),
      searchString: search,
    };

    const history = await getHistoryService(inventoryId, data, userId, isAdmin);
    handleResponse(res, 200, "Inventory history fetched successfully", history);
  } catch (err) {
    next(err);
  }
};
