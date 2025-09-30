import sanitizeHtml from "sanitize-html";

//odstrani neviditelne znaky
const removeInvisibleChars = (text) => {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, "");
}
  
//sanitizuje text
const sanitizeText = (input) => {
    if (typeof input !== "string") return input;
    const trimmed = input.trim();
    const cleaned = sanitizeHtml(trimmed, {
        allowedTags: [],
        allowedAttributes: {},
    });
    return removeInvisibleChars(cleaned)
};

//hloupkova sanitizace pro vnoreny json
const sanitizeDeep = (source) => {
    if (!source) return source;
    if (typeof source === "string") {
         return sanitizeText(source);
    }
    if (typeof source === "object") {
        Object.keys(source).forEach((key) => {
            const cleaned = sanitizeDeep(source[key]);
            source[key] = cleaned;
            // console.log(cleaned)
        })
        return source
    }
    return source
}

//middleware pro sanitizaci
export const sanitize = (req, res, next) => {
    if (req.body) sanitizeDeep(req.body);
    if (req.params) sanitizeDeep(req.params);
    if (req.query) sanitizeDeep(req.query);
    next()
}