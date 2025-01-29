const User = require("../models/UserModel");
const bcrypt = require("bcrypt");

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
  updateUserPassword
};
