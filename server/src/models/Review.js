import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: [true, "Review must be linked to a Business"],
            index: true, // Crucial for performance when fetching reviews for a specific business
        },
        reviewId: {
            type: String,
            required: [true, "Google Review ID is required"],
            unique: true,
            index: true,
        },
        authorName: {
            type: String,
            required: [true, "Author name is required"],
            trim: true,
        },
        authorPhotoUrl: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        text: {
            type: String,
            trim: true,
        },
        publishedAt: {
            type: Date,
            required: [true, "Original publication date is required"],
        },
        fetchedAt: {
            type: Date,
            default: Date.now,
        },
        sentiment: {
            type: String,
            enum: {
                values: ["positive", "negative", "neutral", null],
                message: "{VALUE} is not a valid sentiment",
            },
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index({ businessId: 1, rating: -1 });

// Middleware: Auto-update the "fetchedAt" timestamp on updates
reviewSchema.pre("save", async function () {
    this.fetchedAt = new Date();
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;