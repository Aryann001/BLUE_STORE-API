import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Product Name"],
        trim: true
    },

    description: {
        type: String,
        required: [true, "Please Enter Product Description"],
    },

    productDetails: [
        {
            heading: {
                type: String,
                required: true,
            },
            detail: {
                type: String,
                required: true,
            },
        }
    ],

    price: {
        type: Number,
        required: [true, "Please Enter Product Name"],
        maxLength: [8, "Price cannot exceed 8 figures"]
    },

    ratings: {
        type: Number,
        default: 0
    },

    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    category: {
        type: String,
        required: [true, "Please Enter Product Category"]
    },

    stock: {
        type: Number,
        required: [true, "Please Enter Product Stock"],
        maxLength: [4, "Stocks cannot exceed 4 figures"],
        default: 1,
    },

    numOfReviews: {
        type: Number,
        default: 0,
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },

            name: {
                type: String,
                required: true
            },

            rating: {
                type: Number,
                required: true
            },

            comment: {
                type: String,
                required: true,
            }
        }
    ],

    featured: {
        type: String,
        required: true,
        default: false
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model("Product", productSchema)
