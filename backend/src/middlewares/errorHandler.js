const errorHandling = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? "Something went wrong on the server." : err.message;
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        error: err.name,
    });
};

export default errorHandling;