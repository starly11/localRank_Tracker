import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Alert must belong to a user"],
            index: true, // Optimized for "Get my notifications" queries
        },
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: function () {
                return this.type !== "system_update";
            },
            index: true,
        },
        type: {
            type: String,
            required: [true, "Alert type is required"],
            enum: {
                values: ["rating_drop", "negative_review", "system_update"],
                message: "{VALUE} is not a supported alert type",
            },
        },
        message: {
            type: String,
            required: [true, "Alert message is required"],
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed, 
            default: {},
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, 
    }
);

/**
 * INDEXING:
 * We use a compound index to quickly find unread alerts for a specific user.
 * This makes the "Notification Badge" (e.g., the little red '3') very fast.
 */
alertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

/**
 * STATIC METHOD: Mark All as Read
 * A helper to quickly clear a user's notification tray.
 */
alertSchema.statics.markAllAsRead = async function (userId) {
    return this.updateMany({ userId, isRead: false }, { isRead: true });
};

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
