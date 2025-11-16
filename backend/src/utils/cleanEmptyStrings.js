export const cleanEmptyStrings = (source) => {
    if (source === null || source === undefined) return source;

    if (typeof source === "string") {
        return source === "" ? null : source;
    }

    if (Array.isArray(source)) {
        return source.map(item => cleanEmptyStrings(item));
    }

    if (typeof source === "object") {
        const newObj = {};
        Object.keys(source).forEach((key) => {
        newObj[key] = cleanEmptyStrings(source[key]);
        });
        return newObj;
    }
    return source;
};
