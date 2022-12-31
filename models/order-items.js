const mongoose = require("mongoose");

const ordersItemsSchema = mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
});

exports.OrdersItems = mongoose.model("OrderItems", ordersItemsSchema);
