module.exports.contructPage = (req, res, next) => {
  const pageNumber = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  let skip = (pageNumber - 1) * limit;
  const pageFormat = {
    page: pageNumber,
    limit: limit,
    skip: skip,
  };
  req.pageFormat = pageFormat;
  next();
};
