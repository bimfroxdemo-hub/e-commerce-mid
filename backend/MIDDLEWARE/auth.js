const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "secretkey"); // MUST match login

    req.user = decoded;

    console.log("USER FROM TOKEN:", req.user); // DEBUG

    next();

  } catch (error) {
    console.log("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;