import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Business must be linked to a User"],
            index: true,
        },
        businessName: {
            type: String,
            required: [true, "Business name is required"],
            trim: true,
        },
        googlePlaceId: {
            type: String,
            required: [true, "Google Place ID is required"],
            index: true,
        },
        googlePlaceUrl: {
            type: String,
            trim: true,
        },
        currentRating: {
            type: Number,
            default: 0,
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot be more than 5"],
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        lastFetched: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: String,
            default: "Business",
            trim: true,
            // Example: "Restaurant", "Salon", "Gym"
        },
        address: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * INDEXING:
 * Ensuring we have a compound index if you ever plan to search 
 * for a specific business category within a user's account.
 */
businessSchema.index({ userId: 1, category: 1 });
businessSchema.index({ userId: 1, googlePlaceId: 1 }, { unique: true });

/**
 * MIDDLEWARE: Pre-save Logic (Optional)
 * If you need to perform logic before saving a business 
 * (like normalizing the phone number format), do it here.
 */
businessSchema.pre("save", async function () {
    if (this.isModified("businessName")) {
        this.businessName = this.businessName.trim();
    }
});

const Business = mongoose.model("Business", businessSchema);
export default Business;
