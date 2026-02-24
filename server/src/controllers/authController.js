import passport from "passport";
import User from "../models/User.js";
import Business from "../models/Buisness.js";
import Review from "../models/Review.js";
import Snapshot from "../models/Snapshot.js";
import Alert from "../models/Alerts.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";


const isSecureRequest = (req) => {
    if (req.secure) return true;
    const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
        .split(",")[0]
        .trim()
        .toLowerCase();
    const forwardedSsl = String(req.headers["x-forwarded-ssl"] || "")
        .trim()
        .toLowerCase();
    return forwardedProto === "https" || forwardedSsl === "on";
};
const getPrimaryClientUrl = () => {
    const configured = String(process.env.CLIENT_URL || '').split(',').map((v) => v.trim()).filter(Boolean);
    return configured[0] || 'http://localhost:5173';
};

const setAuthCookie = (req, res, token) => {
    const secure = process.env.NODE_ENV === "production" ? true : isSecureRequest(req);
    res.cookie("token", token, {
        httpOnly: true,
        secure,
        sameSite: secure ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearAuthCookie = (res) => {
    const base = { httpOnly: true, path: "/" };
    res.clearCookie("token", { ...base, secure: true, sameSite: "none" });
    res.clearCookie("token", { ...base, secure: false, sameSite: "lax" });
};

// ---------------------------------------- getMe -------------------------
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ---------------------------------------- register -------------------------
export const register = async (req, res) => {
    // 1. Always check if body exists first
    const { name, email, password } = req.body || {};

    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, email, password) are required"
            });
        }
        const isValidPassword = (password) => password.length >= 8;
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Enter valid email" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            provider: 'local'
        });

        // Generate token for new user
        const token = newUser.generateJWT();

        // Set auth cookie so user is logged in immediately after signup
        setAuthCookie(req, res, token);

        return res.status(201).json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                provider: newUser.provider,
                plan: newUser.plan
            },
            token,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
// -------------------------------------------- Login --------------------------------
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (user.provider !== "local") {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login. Please sign in with Google."
            });
        }

        // Check if user has a password (for Google OAuth users)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login. Please sign in with Google."
            });
        }

        // AWAIT the compare password method!
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate Token
        const token = user.generateJWT();

        setAuthCookie(req, res, token);

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                plan: user.plan
            },
            token,
        });



    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ------------------------------------ googleAuthCallback --------------------
export const googleAuthCallback = async (req, res) => {
    try {
        const clientUrl = getPrimaryClientUrl();

        if (!req.user) {
            return res.redirect(`${clientUrl}/login`);
        }

        const token = req.user.generateJWT();

        // Pass token via URL param so the client (on a different domain)
        // can store it in localStorage — cross-domain cookies are unreliable.
        res.redirect(`${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`);

    } catch (error) {
        console.error("Google Auth Error:", error);
        const clientUrl = getPrimaryClientUrl();
        res.redirect(`${clientUrl}/login`);
    }
};

// ================================ Logout ===================================
export const logout = async (req, res) => {
    try {
        clearAuthCookie(res);


        return res.status(200).json({
            success: true,
            message: 'Logout Successfully'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during logout"
        })
    }
}

// ================================ Delete Account ===================================
export const deleteAccount = async (req, res) => {
    try {
        const { confirmation } = req.body || {};

        if (confirmation !== "DELETE") {
            return res.status(400).json({
                success: false,
                message: 'Type "DELETE" to confirm account deletion',
            });
        }

        const userId = req.user.id;
        const businesses = await Business.find({ userId }).select("_id").lean();
        const businessIds = businesses.map((business) => business._id);

        await Promise.all([
            Review.deleteMany({ businessId: { $in: businessIds } }),
            Snapshot.deleteMany({ businessId: { $in: businessIds } }),
            Alert.deleteMany({ userId }),
            Business.deleteMany({ userId }),
            User.deleteOne({ _id: userId }),
        ]);

        clearAuthCookie(res);

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete account",
        });
    }
};

// ================================ Change Password ===================================
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }
        if (String(newPassword).length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        const user = await User.findById(req.user.id).select("+password");
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (user.provider !== "local") {
            return res.status(400).json({
                success: false,
                message: "Google-auth accounts cannot change password here",
            });
        }

        const valid = await user.comparePassword(currentPassword);
        if (!valid) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

// ================================ Update Profile ===================================
export const updateProfile = async (req, res) => {
    try {
        const { name, email, avatar } = req.body || {};

        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        const normalizedEmail = String(email || "").toLowerCase().trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
        if (!isValidEmail) {
            return res.status(400).json({
                success: false,
                message: "Enter valid email",
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already in use",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    name: String(name).trim(),
                    email: normalizedEmail,
                    avatar: avatar || "",
                },
            },
            { returnDocument: 'after' }
        ).select("-password");

        return res.status(200).json({
            success: true,
            user,
            message: "Profile updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// ================================ Update Notification Settings ===================================
export const updateNotificationSettings = async (req, res) => {
    try {
        const {
            ratingDropAlerts = true,
            negativeReviewAlerts = true,
            weeklyDigest = true,
            dailySummary = false,
            notificationFrequency = "daily",
        } = req.body || {};

        const allowedFrequency = ["realtime", "daily", "weekly"];
        if (!allowedFrequency.includes(notificationFrequency)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification frequency",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    settings: {
                        ratingDropAlerts: Boolean(ratingDropAlerts),
                        negativeReviewAlerts: Boolean(negativeReviewAlerts),
                        weeklyDigest: Boolean(weeklyDigest),
                        dailySummary: Boolean(dailySummary),
                        notificationFrequency,
                    },
                },
            },
            { returnDocument: 'after' }
        ).select("-password");

        return res.status(200).json({
            success: true,
            user,
            message: "Notification preferences updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update notification preferences",
        });
    }
};
// ================================ Forgot Password ===================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

        if (!isValidEmail) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        if (user.provider !== "local") {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login. Please sign in with Google.",
            });
        }

        // Raw token goes to user; hashed token is stored in DB.
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${getPrimaryClientUrl()}/reset-password/${resetToken}`;

        await sendPasswordResetEmail({ to: user.email, resetUrl });

        // Keep resetUrl in non-production for local debugging.
        if (process.env.NODE_ENV !== "production") {
            console.log(`Password reset link for ${user.email}: ${resetUrl}`);
            return res.status(200).json({
                success: true,
                message: "Reset link generated successfully",
                resetUrl,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reset link generated successfully",
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process forgot password request",
        });
    }
};

// ================================ Reset Password ===================================
export const resetPassword = async (req, res) => {
    try {
        const tokenFromParams = req.params?.token;
        const tokenFromBody = req.body?.token;
        const token = tokenFromParams || tokenFromBody;
        const { password } = req.body || {};

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required",
            });
        }

        if (!password || String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpires: { $gt: new Date() },
        }).select("+password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid or expired",
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};
