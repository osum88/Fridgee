const validate = (schema) => (req, res, next) => {
  const validationObject = { ...req.body, ...req.params, ...req.query };
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

  //do body se vraci jen hodnoty ktere prisli z body
  const bodyKeys = Object.keys(req.body);
  const newBody = {};

  bodyKeys.forEach((key) => {
    if (value.hasOwnProperty(key)) {
      newBody[key] = value[key];
    }
  });

  req.body = newBody;
  next();
};

export default validate;
