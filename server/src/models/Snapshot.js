import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: [true, "Snapshot must be linked to a Business"],
            index: true, 
        },
        rating: {
            type: Number,
            required: [true, "Average rating at time of snapshot is required"],
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            required: [true, "Total review count is required"],
            default: 0,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
            index: true, 
        },
        ratingDistribution: {
            fiveStar: { type: Number, default: 0 },
            fourStar: { type: Number, default: 0 },
            threeStar: { type: Number, default: 0 },
            twoStar: { type: Number, default: 0 },
            oneStar: { type: Number, default: 0 },
        },
    },
    {
        versionKey: false,
    }
);

/**
 * INDEXING:
 * Creating a compound index for Time-Series style queries.
 * This makes it incredibly fast to generate a chart for a specific business
 * over a specific time period.
 */
snapshotSchema.index({ businessId: 1, recordedAt: -1 });

/**
 * MIDDLEWARE: Validation
 * Ensuring the distribution numbers don't exceed the totalReviews count.
 */
snapshotSchema.pre("save", async function () {
    const dist = this.ratingDistribution;
    const sum = dist.fiveStar + dist.fourStar + dist.threeStar + dist.twoStar + dist.oneStar;

    if (this.totalReviews > 0 && sum > this.totalReviews) {
        throw new Error("Distribution sum cannot exceed total reviews.");
    }
});

const Snapshot = mongoose.model("Snapshot", snapshotSchema);
export default Snapshot;