import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../errors/errors.js";
import { createFoodCatalogRepository } from "../repositories/foodCatalogRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";

export const createFoodCatalogService = async (data, userId, isAdmin) => {
    const { barcode, title, description, price, unit, amount, isGlobal, foodImageUrl } = data;

    if (isAdmin) {
        await getUserByIdRepository(userId);
    }

    const finalIsGlobal = isAdmin ? isGlobal : false;
    const finalTitle =
        typeof title === "object"
        ? title
        : { unk: title };

    const finalDescription =
        typeof description === "object"
        ? description
        : description
        ? { unk: description }
        : undefined;

    const catalog = await createFoodCatalogRepository(
        userId,
        barcode,
        finalTitle,
        finalDescription,
        price,
        unit,
        amount,
        finalIsGlobal,
        foodImageUrl
    );
    if (!catalog) {
        throw new InternalServerError("Failed to create food catalog.");
    }

  return catalog;
};
