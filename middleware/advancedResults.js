const advancedResults = (model, populate) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  //Field to exclude
  const removeFields = ['select', 'sort', 'limit'];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create operators ($get,$gte...)

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  console.log(queryStr);

  //Finding resource
  let query = model.find(JSON.parse(queryStr));

  if (populate) {
    query = query.populate(populate);
  }

  //Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);
  // Executing query
  const result = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
  }

  req.advancedResult = {
    success: true,
    count: result.length,
    pagination,
    data: result
  };
  next();
};

module.exports = advancedResults;
