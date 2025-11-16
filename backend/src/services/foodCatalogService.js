import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../errors/errors.js";
import { createFoodCatalogRepository, deleteFoodCatalogRepository, getAllFoodCatalogsByUserRepository, getFoodCatalogByBarcodeRepository, getFoodCatalogByIdRepository, updateFoodCatalogRepository } from "../repositories/foodCatalogRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";
import { cleanEmptyStrings } from "../utils/cleanEmptyStrings.js";

//vytvari food catalog
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

//vraci food catalog podle id
export const getFoodCatalogByIdService = async (id) => {
    const catalog = await getFoodCatalogByIdRepository(id);
    return catalog;
};

//vraci vsechny catalogy usera
export const getAllFoodCatalogsByUserService = async (userId, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId);
    }
    const catalogs = await getAllFoodCatalogsByUserRepository(userId);
    return catalogs;
};

//smaze katalog podle id
export const deleteFoodCatalogService = async (id, userId, isAdmin) => {
    const catalog = await getFoodCatalogByIdRepository(id);

    if (!isAdmin && catalog.addedBy !== userId) {
        throw new ForbiddenError("You are not allowed to delete this catalog.");
    }
    await deleteFoodCatalogRepository(id);
    return true
};

// updatuje katalog podle id
export const updateFoodCatalogService = async (foodCatalogId, userId, isAdmin, updateData) => {
    const catalog = await getFoodCatalogByIdRepository(foodCatalogId);
    //kvuli validaci se foodCatalogId dostane do req.body
    delete updateData.foodCatalogId;

    if (isAdmin) {
        await getUserByIdRepository(catalog.addedBy);
    }

    //pokud neni admin a neni vlastnikem katalogu hodi chybu
    if(!isAdmin && catalog.addedBy !== userId) {
        throw new ForbiddenError("You are not allowed to update this catalog.");
    }

    //kontrola jestli uz uzivatel nema katalog s danym barcode
    if (updateData?.barcode) {
        const existingCatalog = await getFoodCatalogByBarcodeRepository(updateData.barcode, catalog.addedBy);
        if (existingCatalog && existingCatalog.id !== foodCatalogId) {
            throw new ConflictError("Food catalog with this barcode already exists.");
        }
    }

    updateData?.foodCatalogId

    //kontroluje ze title neni prazdny
    if (updateData?.title === ""){
        throw new BadRequestError("Title cannot be an empty.");
    }
    if (updateData?.title && typeof updateData.title === "object"){
        const hasAtLeastOneNonEmpty = Object.values(updateData.title).some(value => typeof value === "string" && value !=="");
        if (!hasAtLeastOneNonEmpty){
            throw new BadRequestError("Title cannot be an empty.");
        }
    }

    //vyfiltruje null a undefined hodnoty z updateData
    const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value != null )
    );

    //vsechny prazdne stringy nahradi null
    const finalData = cleanEmptyStrings(filteredData);

    if (finalData.title) {
        finalData.title = typeof finalData.title === "object"
            ? finalData.title
            : { unk: finalData.title };
        finalData.title = {...catalog.title, ...finalData.title};
    }

    if (finalData.description) {
        finalData.description = typeof finalData.description === "object"
            ? finalData.description
            : { unk: finalData.description };
        finalData.description = {...catalog.description, ...finalData.description};
    }

    if (finalData.isGlobal !== undefined) {
        finalData.isGlobal = isAdmin ? finalData.isGlobal : false;
    }

    const updatedCatalog = await updateFoodCatalogRepository(foodCatalogId, finalData);
    return updatedCatalog;
}
    
