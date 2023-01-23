const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});

commentsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
commentsSchema.set("toJSON", {
  virtuals: true,
});
exports.Comments = mongoose.model("Comments", commentsSchema);
