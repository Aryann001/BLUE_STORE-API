import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Features from "../utils/features.js";
import cloudinary from "cloudinary";

//CREATE PRODUCT --ADMIN
export const createProduct = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLink = [];
  let productDetail = JSON.parse(req.body.productDetails);

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "Products Images",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLink;
  req.body.user = req.user.id;
  req.body.productDetails = productDetail;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//UPDATE PRODUCT --ADMIN
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler(`Product Not Exist`, 400));
  }

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    let imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "Products Images",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//DELETE PRODUCT --ADMIN
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler(`Product Not Exist`, 400));
  }

  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: `Product Deleted Successfully!`,
  });
});

//FILTER PRODUCTS
export const filteredProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10;
  const productCount = await Product.countDocuments();

  const features = new Features(Product.find(), req.query).search().filter();

  let products = await features.query;

  let filteredProductCount = products.length;

  features.pagination(resultPerPage);

  products = await features.query.clone();

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage,
    filteredProductCount,
  });
});

//FEATURED PRODUCTS
export const featuredProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10;
  const productCount = await Product.countDocuments();

  const features = new Features(
    Product.find({ featured: "true" }),
    req.query
  ).pagination(resultPerPage);

  const products = await features.query;

  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

//GET ALL PRODUCTS -- ADMIN
export const getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

//GET SINGLE PRODUCT
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler(`Product Not Exist`, 400));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

/////////////////////////////////////////--REVIEWS--///////////////////////////////////////

//CREATE AND UPDATE REVIEWS
export const createProductReviews = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productID } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productID);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  if (product.reviews.length === 0) {
    product.ratings = 0;
  } else {
    product.ratings = avg / product.reviews.length;
  }

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//GET ALL REVIEWS
export const getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler(`Product Not Found`, 400));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//DELETE REVIEWS
export const deleteReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler(`Product Not Found`, 400));
  }

  const reviews = product.reviews.filter((rev) => {
    rev._id.toString() !== req.query.id.toString();
  });

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({
    success: true,
    message: `Review Deleted Successfully`,
  });
});
