// utils/errorHandler.js
class CustomError extends Error {
    constructor(message, statusCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Mark as operational error
        this.details = details; // Optional: for validation errors, etc.
        Error.captureStackTrace(this, this.constructor);
    }
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err };
    error.message = err.message;
    error.details = err.details; // Pass details from CustomError

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new CustomError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = `Duplicate field value entered: ${Object.keys(err.keyValue)} already exists.`;
        error = new CustomError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = new CustomError(`Invalid input data: ${messages.join('. ')}`, 400, messages);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new CustomError('Invalid token. Please log in again!', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new CustomError('Your token has expired! Please log in again.', 401);
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        // Only send detailed error in development
        error: process.env.NODE_ENV === 'development' ? error : undefined,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
};

module.exports = { CustomError, globalErrorHandler };
