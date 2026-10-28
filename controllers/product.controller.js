
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

// Helper to extract YouTube video ID from a URL or ID
const extractYouTubeId = (url) => {
  if (!url) return "";

  // Accept an existing 11-character video ID
  if (/^[\w-]{11}$/.test(url)) return url;

  try {
    const parsedUrl = new URL(
      url.startsWith("http") ? url : `https://${url}`
    );

    let videoId = "";

    if (parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/")[1];
    } else if (parsedUrl.hostname.endsWith("youtube.com")) {
      videoId =
        parsedUrl.searchParams.get("v") ||
        parsedUrl.pathname.split("/").filter(Boolean).pop();
    }

    return /^[\w-]{11}$/.test(videoId || "") ? videoId : "";
  } catch {
    return "";
  }
};

// Helper to delete uploaded Cloudinary images if product creation fails
const deleteCloudinaryImages = async (files = []) => {
  await Promise.allSettled(
    files
      .filter((file) => file.filename)
      .map((file) =>
        cloudinary.uploader.destroy(file.filename, {
          resource_type: "image",
        })
      )
  );
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Create a product with Cloudinary images
// @route   POST /api/products
// @access  Authenticated user/seller
export const createProduct = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    const {
      title,
      description,
      price,
      category,
      stock,
      weightGrams,
      platingType,
      stoneDetails,
      youtubeVideoId,
      isFeatured,
    } = req.body;

    // Cloudinary URLs returned by multer-storage-cloudinary
    const images = uploadedFiles.map((file) => file.path);

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: stock === undefined ? 0 : Number(stock),
      weightGrams: Number(weightGrams),
      platingType: platingType || "1 Gram Gold Plated",
      stoneDetails: stoneDetails || "None",
      images,
      youtubeVideoId: extractYouTubeId(youtubeVideoId),
      isFeatured: isFeatured === true || isFeatured === "true",
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Avoid leaving orphaned images in Cloudinary if creation fails
    await deleteCloudinaryImages(uploadedFiles);

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin or product owner
export const updateProduct = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      await deleteCloudinaryImages(uploadedFiles);
      return res.status(404).json({ message: "Product not found" });
    }

    // Admin can update any product; other users can update their own
    if (
      req.user.role !== "admin" &&
      product.seller?.toString() !== req.user._id.toString()
    ) {
      await deleteCloudinaryImages(uploadedFiles);

      return res.status(403).json({
        message: "Not authorized to update this product",
      });
    }

    const {
      title,
      description,
      price,
      category,
      stock,
      weightGrams,
      platingType,
      stoneDetails,
      youtubeVideoId,
      isFeatured,
      images: existingImages,
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);
    if (weightGrams !== undefined) {
      updates.weightGrams = Number(weightGrams);
    }
    if (platingType !== undefined) updates.platingType = platingType;
    if (stoneDetails !== undefined) updates.stoneDetails = stoneDetails;
    if (youtubeVideoId !== undefined) {
      updates.youtubeVideoId = extractYouTubeId(youtubeVideoId);
    }
    if (isFeatured !== undefined) {
      updates.isFeatured =
        isFeatured === true || isFeatured === "true";
    }

    // Existing URLs may be sent as a JSON array in form-data
    if (existingImages !== undefined) {
      try {
        updates.images =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        if (!Array.isArray(updates.images)) {
          throw new Error("Images must be an array");
        }
      } catch {
        await deleteCloudinaryImages(uploadedFiles);

        return res.status(400).json({
          message: 'The "images" field must be a valid JSON array.',
        });
      }
    }

    // Add newly uploaded Cloudinary URLs to retained images
    if (uploadedFiles.length > 0) {
      const retainedImages =
        updates.images !== undefined ? updates.images : product.images;

      updates.images = [
        ...retainedImages,
        ...uploadedFiles.map((file) => file.path),
      ];
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedFiles);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin or product owner
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      req.user.role !== "admin" &&
      product.seller?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this product",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
