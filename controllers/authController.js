const bcrypt = require("bcrypt");
const nodeappwrite = require("node-appwrite");
const User = require("../models/UserModel");
const {
  createAdminClient,
  createSessionClient,
} = require("../config/appwrite");
const { ID } = nodeappwrite;

const OAuthProvider = require("appwrite").OAuthProvider;

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { account } = await createAdminClient(req, res);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) return res.status(401).json({ message: "Invalid Credentials" });

  // Create a appwrite session for new user
  try {
    await account.create(ID.unique(), email, password);
  } catch (err) {
    console.log(err?.message);
  }

  const session = await account.createEmailPasswordSession(email, password);

  foundUser.userId = session.$id;
  await foundUser.save();

  res.cookie("appwrite-session", session?.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400000,
    // secure: true,
  });

  res.json({ accessToken: session?.secret, id: foundUser._id });
};

const createNewUser = async (req, res) => {
  const { account } = await createAdminClient();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate email
  const duplicate = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  const newUserAccount = await account.create(ID.unique(), email, password);

  if (!newUserAccount) throw new Error("Error creating user");

  // Create and store new user
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = {
    email,
    password: hashedPassword,
    userId: newUserAccount.$id,
  };

  const user = await User.create(userObject);

  // Create a appwrite session for new user
  const session = await account.createEmailPasswordSession(email, password);

  res.cookie("appwrite-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400000,
    // secure: true,
  });

  if (user) {
    return res.json({
      accessToken: session.secret,
      id: user._id,
      message: `New user ${email} created`,
    });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
};

// @route GET /auth/google
// @access Public
const googleAuth = async (req, res) => {
  try {
    const { account } = await createAdminClient();

    // Create OAuth token
    // const token = await account.createOAuth2Token({
    //   provider: nodeappwrite.OAuthProvider.Google,
    //   success: "http://localhost:3500/auth/google/callback",
    //   failure: "http://localhost:5173/login?error=google_failed",
    // });

    const token = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: "https://note-taking-app-backend-silq.onrender.com/auth/google/callback",
      failure: "https://note-taking-app-backend-silq.onrender.com/auth/google/failure",
    });
    return res.redirect(token.url);
  } catch (err) {
    console.log("GOOGLE AUTH ERROR:", err);
    return res
      .status(500)
      .json({ message: err?.message || "Google auth init failed" });
  }
};

// @route GET /auth/google/callback
// @access Public
const googleCallback = async (req, res) => {
  try {
    const { account } = await createSessionClient(req, res);

    // Get Appwrite user info
    const appwriteUser = await account.get();

    const email = appwriteUser.email;
    const appwriteId = appwriteUser.$id;

    // Check if Mongo user exists
    let user = await User.findOne({ email }).exec();

    if (!user) {
      // Create a new DB user if not found
      user = await User.create({
        email,
        password: null, // Google login has no password
        userId: appwriteId,
      });
    } else {
      // Ensure Appwrite ID is linked
      user.userId = appwriteId;
      await user.save();
    }

    // Retrieve the session (Appwrite just created it)
    const sessions = await account.listSessions();
    const session = sessions.sessions[0];

    // Set your cookie
    res.cookie("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400000,
      // secure: true,
    });

    return res.redirect(
      `http://${process.env.FRONTEND_URL}/?token=${session.secret}&id=${user._id}`
    );
  } catch (err) {
    console.log(err);
    return res.redirect(
      `http://${process.env.FRONTEND_URL}/login?error=session_failed`
    );
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
  const { account } = await createAdminClient();

  res.clearCookie("appwrite-session", {
    httpOnly: true,
    sameSite: "Lax",
    secure: true,
  });

  await account.deleteSession("current");
  res.json({ message: "Logged out successfully!" });
};

module.exports = {
  createNewUser,
  login,
  googleAuth,
  googleCallback,
  logout,
  forgotPassword,
  resetPassword,
};
