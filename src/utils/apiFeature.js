export default class ApiFeature {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  pagination() {
    let page = this.queryStr.page || 1;
    if (this.queryStr.page < 1) page = 1;
    let skip = (page - 1) * 10;
    this.page = page;
    this.mongooseQuery.skip(skip).limit(10);
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      let sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortBy);
    }
    return this;
  }
  search() {
    if (this.queryStr.keyword) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryStr.keyword, $options: "i" } },
          { description: { $regex: this.queryStr.keyword, $options: "i" } },
        ],
      });
    }
    return this;
  }
}
