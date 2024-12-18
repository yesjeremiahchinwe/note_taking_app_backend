const User = require("../models/UserModel");
const { sendEmail } = require("../config/emailConfig");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const createNewUser = async (req, res) => {
  const { email, password } = req.body;

  // Confirm data
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

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = { email, password: hashedPassword };

  // Create and store new user
  const user = await User.create(userObject);

  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: user?.email,
        userId: user?._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "240d" }
  );

  const refreshToken = jwt.sign(
    { email: user?.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "356d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "Lax", //cross-site cookie
    maxAge: 365 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  if (user) {
    // Send the user a welcome email
    sendEmail(
      email,
      "Congratulations! Your account has been created successfully!",
      "We're glad to have you join us on Notes - your number one note taking app. Thank you for signing up."
    );

    // Send accessToken containing username and roles
    return res.json({ accessToken, message: `New user ${email} created` });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
};

const updateUserPassword = async (req, res) => {
  const { userId, oldPassword, newPassword, confirmNewPassword } = req.body;

  // Confirm data
  if (!userId || !oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Does the user exist to update?
  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  const match = await bcrypt.compare(oldPassword, user.password);

  if (!match) return res.status(401).json({ message: "Invalid Credentials" });

  if (newPassword !== confirmNewPassword) {
    return res.status(401).json({ message: "Passwords do not match" });
  }

  user.password = await bcrypt.hash(newPassword, 10);

  const updatedUser = await user.save();

  res.json({
    message: `Password for account ${updatedUser.email} updated successfully!`,
  });
};

module.exports = {
  createNewUser,
  updateUserPassword,
};
