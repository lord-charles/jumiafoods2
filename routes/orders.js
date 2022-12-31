const express = require("express");
const router = express.Router();
const { OrdersItems } = require("../models/order-items");
const { Orders } = require("../models/orders");

// get request
router.get("/", async (req, res) => {
  const orders = await Orders.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orders) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(orders);
});

//get products by id
router.get("/:id", (req, res) => {
  Orders.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    }) //populate is used to populate the category table to orders
    .then((orders) => {
      if (!orders) {
        res.status(500).json({
          success: false,
        });
      } else {
        res.status(200).send(orders);
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err.message });
    });
});

// post order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrdersItems({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  //calculating totalprices internally
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemsId) => {
      const orderItem = await OrdersItems.findById(orderItemsId).populate(
        "product"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
  //end of price calculation

  let order = new Orders({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) {
    return res.status(400).send("order cannot be created!");
  } else {
    res.send(order);
  }
});
//update order by id
router.put("/:id", (req, res) => {
  Orders.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },

    { new: true }
  )
    .then((order) => {
      if (!order) {
        res.status(500).json({
          success: false,
          message: "No order found by this id",
        });
      } else {
        res.status(200).send(order);
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err.message });
    });
});

//delete order
router.delete("/:id", (req, res) => {
  Orders.findByIdAndRemove(req.params.id)
    .then((order) => {
      if (!order) {
        res.status(404).send("order not found!");
      } else {
        res
          .status(200)
          .send(`The following order has been removed: ${order._id}`);
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

//get total sales
router.get("/get/totalSales", (req, res) => {
  Orders.aggregate([
    {
      $group: { _id: null, totalSales: { $sum: "$totalPrice" } },
    },
  ])
    .then((totalSales) => {
      if (!totalSales) {
        res.status(404).send("Order sales cannot be generated!");
      } else {
        res.status(200).send({ totalSales: totalSales.pop().totalSales }); //.pop() removes and return last element in the array
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

//get ordersCount
router.get("/get/orderCount", (req, res) => {
  Orders.countDocuments()
    .then((ordersCount) => {
      if (!ordersCount) {
        res.status(404).send("invalid order count!");
      } else {
        res.status(200).send({ ordersCount: ordersCount });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});
module.exports = router;

// {
//     "orderItems": [
//         {
//             "quantity": 3,
//             "product": "63ab070bf645c9df702a9d28"
//         },
//          {
//             "quantity": 3,
//             "product": "63a97ba3d8b50af6b297e3d7"
//         }
//     ],
// "shippingAddress1": "nairobi",
// "shippingAddress2": "nanyuki",
// "city": "nakuru",
// "zip": "144", "name": "electronics",
//         "icon": "icon url",
//         "color": "blue",
// "country": "kenya",
// "phone": "0738792982",
// "user": "63ac18b26c90f9855101e9e4"
// }
