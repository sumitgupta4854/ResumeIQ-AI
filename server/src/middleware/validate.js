export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: error.details.map(d => d.message) }
      });
    }
    req[source] = value;
    next();
  };
}

export function validateObjectIdParam(param = 'id') {
  return (req, res, next) => {
    const v = req.params[param];
    if (!/^[a-fA-F0-9]{24}$/.test(v || '')) {
      return res.status(400).json({ success: false, error: { message: `Invalid id parameter: ${param}` } });
    }
    next();
  };
}
