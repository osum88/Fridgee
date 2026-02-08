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
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: 400,
      message: "Validation failed",
      errors: errorMessages,
    });
  }

  const newBody = { ...value };

  // odstrani klice ltere nepatri do aprams nebo quary
  Object.keys(params).forEach((key) => delete newBody[key]);
  Object.keys(query).forEach((key) => delete newBody[key]);

  req.body = newBody;
  next();
};

export default validate;
