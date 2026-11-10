const { ZodError } = require('zod');

/**
 * Higher-order middleware to validate incoming request data against a Zod schema.
 *
 * On validation failure, returns a structured 400 response with:
 *   - message: human-readable summary
 *   - errors: { fieldName: 'Error message' } map (first error per field)
 *
 * This format lets the frontend highlight per-field errors directly.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to parse against
 * @param {'body' | 'query' | 'params'} [source='body'] - Which request property to validate
 */
const validate = (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (result.success) {
      // Replace raw data with sanitized + typed data from Zod
      req[source] = result.data;
      return next();
    }

    // Build a field → first error message map from Zod's flat error list
    const fieldErrors = {};
    result.error.errors.forEach((issue) => {
      // issue.path is an array like ['email'] or ['endDate']
      // For root-level refinements, path may be empty — use '_root' as the key
      const key = issue.path.length > 0 ? issue.path.join('.') : '_root';
      if (!fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check the highlighted fields.',
      errors: fieldErrors,
    });
  };

module.exports = validate;
