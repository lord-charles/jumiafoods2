const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/products");
const multer = require("multer");

//post / upload images using multer
const FILE_TYPE_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image file type");
    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extention = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extention}`);
  },
});

const uploadOptions = multer({ storage: storage });
//end of multer

// get request
router.get("/", async (req, res) => {
  let filter = req.query.categories
    ? { category: req.query.categories.split(",") }
    : {};

  const products = await Product.find(filter).populate("category");
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(products);
});

//get products by id
router.get("/:id", (req, res) => {
  Product.findById(req.params.id)
    .populate("category") //populate is used to populate the category table to products
    .then((products) => {
      if (!products) {
        res.status(500).json({
          success: false,
          message: "product not found!",
        });
      } else {
        res.status(200).send(products);
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err });
    });
});

//post request
router.post("/", uploadOptions.single("image"), async (req, res) => {
  //used for multer
  const fileImage = req.file;
  if (!fileImage)
    //ensuring image exists before proceeding
    return res.status(400).send("images must be specified");
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}//public/uploads/`;
  //end of multer

  const category = await Category.findById(req.body.category);
  if (!category) return res.send(400).send("invalid category");
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  product = await product.save();
  if (!product) return res.status(500).send("product cannot be created");
  res.send(product);
});

//upload multiple images using put

router.put(
  "/uploadImages/:id",
  uploadOptions.array("images", 10),
  (req, res) => {
    //used for multer
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const fileImages = req.files;
    let imagesPaths = [];
    if (fileImages.length < 1) {
      //ensuring image exists before proceeding
      return res.status(400).send("images must be specified");
    } else {
       fileImages.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    //end of multer

    Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    )
      .then((product) => {
        if (!product) {
          res.status(404).send("product not found");
        } else {
          res.status(200).send(product);
        }
      })
      .catch((error) => {
        res.status(500).send({ message: error
        });
      });
  }
);

//update product
router.put("/:id", (req, res) => {
  Category.findById(req.body.category)
    .then((category) => {
      if (!category) {
        return res.status(404).send("invalid category");
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
  Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  )
    .then((product) => {
      if (!product) {
        res.status(404).send("product not found");
      } else {
        res.status(200).send(product);
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

//delete product
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (!product) {
        res.status(404).send("product not found!");
      } else {
        res
          .status(200)
          .send(`The following product has been removed: ${product.name}`);
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

//get productCount
router.get("/get/productCount", (req, res) => {
  Product.countDocuments()
    .then((productsCount) => {
      if (!productsCount) {
        res.status(404).send("invalid product count!");
      } else {
        res.status(200).send({ productsCount: productsCount });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

//get isfeatured
router.get(`/get/isFeatured/:count?`, (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  Product.find({ isFeatured: true })
    .limit(+count)
    .then((isFeatured) => {
      if (!isFeatured) {
        res.status(404).send("No featured product found!");
      } else {
        res.status(200).send(isFeatured);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

module.exports = router;
