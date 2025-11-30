const validate = (schema) => (req, res, next) => {
    const validationObject = { ...req.body, ...req.params, ...req.query };
    const { error, value } = schema.validate(validationObject, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: errorMessages,
        });
    }
    // req.body = value;
    next();
};

export default validate;

