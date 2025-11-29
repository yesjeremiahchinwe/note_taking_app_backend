const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.headers.Authorization?.split(" ")[1];
  const authHeader = req.headers.authorization || req.headers.Authorization

  if (!token || !authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyJWT;



// const verifyJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization

//   if (!authHeader?.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Unauthorized' })
//   }

//   next();
// };

// module.exports = verifyJWT;

