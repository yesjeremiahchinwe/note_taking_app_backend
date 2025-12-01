const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utilities/tokenGenerators");

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    // Tokens
    const accessToken = generateAccessToken({ id: foundUser._id });
    const refreshToken = generateRefreshToken({ id: foundUser._id });

    foundUser.refreshToken = refreshToken;

    await foundUser.save();

    // Set cookie
    res.cookie("refresh_token", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 21 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      id: foundUser._id,
      data: {
        user: foundUser,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// @route GET /auth/signup
// @access Public
const createNewUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const duplicate = await User.findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      username,
    });

    res.json({
      success: true,
      message: `New user ${email} created`,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

const googleAuthFailed = async (req, res) => {
  return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_failed`);
};

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// @route GET /auth/google
// @access Public
// Initiate Google OAuth2 flow
const googleAuth = async (req, res) => {
  try {
    const redirectUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["profile", "email"],
    });

    return res.redirect(redirectUrl);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || "Google auth init failed" });
  }
};

// @route GET /auth/google/callback
// @access Public
// Handle Google OAuth2 callback
const googleCallback = async (req, res) => {
  console.log("Google callback called");
  try {
    const code = req.query.code;

    // 1. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log("Tokens received:", tokens);

    // 2. Decode user's Google profile
    const googleUser = jwt.decode(tokens.id_token);

    console.log("Google user profile:", googleUser);

    const email = googleUser.email;
    const username = googleUser.name;
    const picture = googleUser.picture;

    // 3. Check if user exists in Mongo
    let user = await User.findOne({ email });

    console.log("User found in DB:", user);

    if (!user) {
      user = await User.create({
        email,
        password: null,
        googleId: googleUser.sub,
        username,
        avatar: picture,
      });
    } else {
      user.googleId = googleUser.sub;
      await user.save();
    }

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    console.log("Generated tokens:", { accessToken, refreshToken });

    user.refreshToken = refreshToken;
    await user.save();

    console.log("User after saving refresh token:", user);

    res.cookie("refresh_token", refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 21 * 24 * 60 * 60 * 1000
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/success?accessToken=${accessToken}&id=${user._id}`
    );
  } catch (err) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=session_failed`
    );
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(401).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken({ id: user._id });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refresh_token", newRefreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 21 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Token expired" });
  }
};

// @desc Forgot Password
// @route GET /auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
};

// @desc ResetPassword
// @route POST /auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  const { userId, newPassword, confirmNewPassword } = req.body;

  const foundUser = await User.findOne({ _id: userId }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User Not Found" });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(401).json({ message: "Passwords do not match" });
  }

  // Hash password
  foundUser.password = await bcrypt.hash(newPassword, 10);

  const updatedUser = await foundUser.save();

  res.json({ message: `Password reset for ${updatedUser.email} successful!` });
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = async (req, res) => {
  res.clearCookie("refresh_token");

  res.json({ success: true, message: "Logged out successfully!" });
};

module.exports = {
  createNewUser,
  login,
  refreshToken,
  googleAuth,
  googleCallback,
  googleAuthFailed,
  logout,
  forgotPassword,
  resetPassword,
};
