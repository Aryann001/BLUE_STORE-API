import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Banner from "../models/bannerModel.js";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/errorHandler.js";

export const createBanner = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "Banner Images",
    });

    imagesLink.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLink;

  const banner = await Banner.create(req.body);

  res.status(201).json({
    success: true,
    banner,
  });
});

export const updateBanner = catchAsyncErrors(async (req, res, next) => {
  let banner = await Banner.find()[0];

  if (!banner) {
    return next(new ErrorHandler(`No Images in Banner`), 400);
  }

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < banner.images.length; i++) {
      await cloudinary.v2.uploader.destroy(banner.images[i].public_id);
    }

    let imagesLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "Banner Images",
      });

      imagesLink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLink;
  }

  banner = await Banner.updateOne({ images }, req.body.images, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    banner,
  });
});

export const deleteBanner = catchAsyncErrors(async (req, res, next) => {
  let banner = await Banner.find()[0];

  if (!banner) {
    return next(new ErrorHandler(`No Images in Banner`), 400);
  }

  for (let i = 0; i < banner.images.length; i++) {
    await cloudinary.v2.uploader.destroy(banner.images[i].public_id);
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: `Banner Deleted Successfully!`,
  });
});

export const getBanner = catchAsyncErrors(async (req, res, next) => {
  const banner = await Banner.find();

  res.status(200).json({
    success: true,
    banner: banner[0],
  });
});
