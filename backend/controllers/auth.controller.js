import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import { sendVerificationEmail } from "../lib/email.js";
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";

const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_RESEND_MESSAGE =
  "If an unverified account exists for that email, a verification link has been sent.";

const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();
const isEmailVerificationEnabled = () =>
  process.env.EMAIL_VERIFICATION_ENABLED === "true";

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    hashedToken,
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  };
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const signup = async (req, res) => {
  const { name: submittedName, email: submittedEmail, password: submittedPassword } =
    req.body ?? {};
  const name = String(submittedName ?? "").trim();
  const email = normalizeEmail(submittedEmail);
  const password = String(submittedPassword ?? "");

  if (!name || !EMAIL_PATTERN.test(email) || password.length < 6) {
    return res.status(400).json({
      message: "Enter a name, a valid email address, and a password of at least 6 characters.",
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!isEmailVerificationEnabled()) {
      const user = await User.create({
        name,
        email,
        password,
        isVerified: true,
      });
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        success: true,
        requiresVerification: false,
        user: publicUser(user),
        message: "Account created successfully.",
      });
    }

    const { rawToken, hashedToken, expiresAt } = createVerificationToken();
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpiresAt: expiresAt,
    });

    try {
      await sendVerificationEmail({ email: user.email, name: user.name, rawToken });
    } catch (error) {
      console.error("Unable to send the signup verification email:", error.message);
      return res.status(500).json({
        success: false,
        requiresVerification: true,
        emailDeliveryFailed: true,
        message:
          "Your account was created, but the verification email could not be sent. Please request another verification email.",
      });
    }

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message: "Account created. Please check your email to verify your account.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Unable to create your account right now." });
  }
};

export const verifyEmail = async (req, res) => {
  const rawToken = String(req.query.token ?? "").trim();

  if (!/^[a-f\d]{64}$/i.test(rawToken)) {
    return res.status(400).json({
      message: "Verification link is invalid or has expired.",
    });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await User.findOneAndUpdate(
      {
        verificationToken: hashedToken,
        verificationTokenExpiresAt: { $gt: new Date() },
        isVerified: false,
      },
      {
        $set: { isVerified: true },
        $unset: {
          verificationToken: 1,
          verificationTokenExpiresAt: 1,
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired.",
      });
    }

    return res.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).json({ message: "Unable to verify your email right now." });
  }
};

export const resendVerificationEmail = async (req, res) => {
  if (!isEmailVerificationEnabled()) {
    return res.json({
      success: true,
      verificationDisabled: true,
      message: "Email verification is temporarily disabled. You can log in normally.",
    });
  }

  const email = normalizeEmail(req.body?.email);

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  try {
    const emailFingerprint = crypto.createHash("sha256").update(email).digest("hex");
    const cooldownCreated = await redis.set(
      `verification_resend:${emailFingerprint}`,
      "1",
      "EX",
      RESEND_COOLDOWN_SECONDS,
      "NX",
    );

    if (!cooldownCreated) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another verification email.",
      });
    }

    // Matching explicit false excludes legacy users whose database record has no
    // isVerified field, so this endpoint cannot accidentally lock an old account.
    const user = await User.findOne({ email, isVerified: false });

    if (!user) {
      return res.json({ message: GENERIC_RESEND_MESSAGE });
    }

    const { rawToken, hashedToken, expiresAt } = createVerificationToken();
    user.verificationToken = hashedToken;
    user.verificationTokenExpiresAt = expiresAt;
    await user.save();

    try {
      await sendVerificationEmail({ email: user.email, name: user.name, rawToken });
    } catch (error) {
      console.error("Unable to resend the verification email:", error.message);
      return res.status(500).json({
        message: "Unable to send a verification email right now. Please try again later.",
      });
    }

    return res.json({ message: GENERIC_RESEND_MESSAGE });
  } catch (error) {
    console.error("Error while resending a verification email:", error);
    return res.status(500).json({
      message: "Unable to send a verification email right now. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isVerified !== true && !isEmailVerificationEnabled()) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: { isVerified: true },
          $unset: {
            verificationToken: 1,
            verificationTokenExpiresAt: 1,
          },
        },
      );
      user.isVerified = true;
    } else if (user.isVerified !== true) {
      // Read the stored shape directly because Mongoose can apply schema defaults
      // while hydrating legacy records that do not contain this field.
      const storedVerificationState = await User.collection.findOne(
        { _id: user._id },
        { projection: { isVerified: 1 } },
      );
      const isLegacyAccount =
        storedVerificationState &&
        !Object.prototype.hasOwnProperty.call(storedVerificationState, "isVerified");

      if (!isLegacyAccount) {
        return res.status(403).json({
          message: "Please verify your email before logging in.",
          requiresVerification: true,
        });
      }

      // Safely migrate the legacy customer or admin after their password succeeds.
      user.isVerified = true;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    return res.json({
      user: publicUser(user),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Unable to log in right now." });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    return res.json({ accessToken, message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    return res.json(req.user);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};
