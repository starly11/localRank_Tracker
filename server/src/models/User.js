import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        password: {
            type: String,
            required: function () {
                return this.provider === "local";
            },
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatar: {
            type: String,
            trim: true,
        },
        settings: {
            ratingDropAlerts: {
                type: Boolean,
                default: true,
            },
            negativeReviewAlerts: {
                type: Boolean,
                default: true,
            },
            weeklyDigest: {
                type: Boolean,
                default: true,
            },
            dailySummary: {
                type: Boolean,
                default: false,
            },
            notificationFrequency: {
                type: String,
                enum: ["realtime", "daily", "weekly"],
                default: "daily",
            },
        },
        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpires: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true, }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        // Throwing an error stops the save process automatically
        throw new Error(`Encryption failed: ${error.message}`);
    }
});

/**
 * METHOD: Generate JWT
 * Generates a signed token for authentication
 */
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
};

/**
 * METHOD: Compare Password
 * Validates the plain text password against the hashed version
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password) {
        throw new Error("Password field not selected. Use .select('+password') in your query.");
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
