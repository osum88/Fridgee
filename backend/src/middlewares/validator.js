const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: errors, 
        });
    }
    req.body = value;
    next(); 
};

export default validate;