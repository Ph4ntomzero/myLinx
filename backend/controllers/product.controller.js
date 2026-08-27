import { redis } from "../lib/redis.js";
import cloudinary from "..\/lib/cloudinary.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const withCacheTimeout = (operation) =>
  Promise.race([
    operation,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Cache request timed out")), 1500);
    }),
  ]);

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.log("Error fetching products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let cachedProducts = null;

    // Redis is an optional cache. A cache outage must not make the storefront
    // look empty or prevent customers from seeing featured products.
    try {
      cachedProducts = await withCacheTimeout(redis.get("featured_products"));
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        if (parsedProducts.length > 0) {
          return res.json({ products: parsedProducts });
        }
      }
    } catch (cacheError) {
      console.warn("Featured-products cache unavailable:", cacheError.message);
    }

    let featuredProducts = await Product.find({ isFeatured: true }).lean();

    // Keep the home page useful before an admin has selected featured items.
    // Once items are marked featured, they always take priority here.
    if (featuredProducts.length === 0) {
      featuredProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    }

    try {
      await withCacheTimeout(redis.set(
        "featured_products",
        JSON.stringify(featuredProducts),
        "EX",
        3600,
      ));
    } catch (cacheError) {
      console.warn("Unable to cache featured products:", cacheError.message);
    }

    res.json({ products: featuredProducts });
  } catch (error) {
    console.log("Error fetching featured products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = getCloudinaryPublicId(product.image);
      try {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Image ${publicId} deleted from Cloudinary`);
        }
      } catch (error) {
        console.error(
          `Error deleting image ${publicId} from Cloudinary:`,
          error.message,
        );
      }
    }

    // findByIdAndDelete belongs to the Product model, not an individual document.
    await Product.findByIdAndDelete(product._id);
    await User.updateMany(
      { "cartItems.product": product._id },
      { $pull: { cartItems: { product: product._id } } },
    );
    await updateFeaturedProductsCache();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 1 },
      },
      {
        $project: {
          id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]); // Randomly select 3 products
    res.json({ products });
  } catch (error) {
    console.error("Error fetching recommended products:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {


    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();


            // Invalidate the cache for featured products since the featured status has changed
            await updateFeaturedProductsCache();
            res.json(updatedProduct);

        }
        else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error toggling featured status:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function updateFeaturedProductsCache() {

    try {
        // Fetch the updated list of featured products from the database
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        // Update the cache with the new list of featured products
        await withCacheTimeout(redis.set(
            "featured_products",
            JSON.stringify(featuredProducts),
            "EX",
            3600,
        ));
    } catch (error) {
        console.error("Error updating featured products cache:", error.message);
    }
}

function getCloudinaryPublicId(imageUrl) {
  try {
    const uploadPath = new URL(imageUrl).pathname.split("/upload/")[1];
    if (!uploadPath) return null;

    return decodeURIComponent(uploadPath)
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}
