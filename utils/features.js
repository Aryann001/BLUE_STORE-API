class Features {
  constructor(query, queryStr) {
    this.query = query,
    this.queryStr = queryStr
  }

  search() {
    const search = this.queryStr.search
      ? {
          name: {
            $regex: this.queryStr.search,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...search });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    const removeFeilds = ["search", "page", "limit"];
    removeFeilds.forEach((value) => delete queryCopy[value]);

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (value) => `$${value}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

export default Features;
