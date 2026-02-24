import { BadRequestError } from "../errors/errors.js";

const validate = (schema) => (req, res, next) => {
  const body = req.body || {};
  const params = req.params || {};
  const query = req.query || {};

  const validationObject = { ...body, ...params, ...query };

  const { error, value } = schema.validate(validationObject, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (error) {
    // const errorMessages = error.details.map((detail) => detail.message);
    // return res.status(400).json({
    //   status: 400,
    //   message: "Validation failed",
    //   errors: errorMessages,
    // });
    const firstDetail = error.details[0];

    const fieldName = firstDetail.context.label || firstDetail.context.key;
    const errorCode = firstDetail.type.replace(".", "_").toUpperCase();

    throw new BadRequestError(firstDetail.message, {
      type: fieldName,
      code: errorCode,
    });
  }

  const validatedParams = {};
  const validatedQuery = {};
  const validatedBody = { ...value };

  // prepise zvalidovane hodnoty a zbytek necha
  Object.keys(params).forEach((key) => {
    validatedParams[key] = value[key];
    delete validatedBody[key];
  });

  Object.keys(query).forEach((key) => {
    validatedQuery[key] = value[key];
    delete validatedBody[key];
  });

  // Aktualizace PARAMS
  const finalParams = { ...params, ...validatedParams };
  Object.keys(req.params || {}).forEach((key) => delete req.params[key]);
  Object.assign(req.params || {}, finalParams);

  // Aktualizace QUERY
  const finalQuery = { ...query, ...validatedQuery };
  Object.keys(req.query || {}).forEach((key) => delete req.query[key]);
  Object.assign(req.query || {}, finalQuery);

  // Aktualizace BODY
  if (!req.body) req.body = {};
  Object.keys(req.body).forEach((key) => delete req.body[key]);
  Object.assign(req.body, validatedBody);

  // console.log("params", req.params);
  // console.log("body", req.body);
  // console.log("query", req.query);
  next();
};

export default validate;
