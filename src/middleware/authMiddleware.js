import jwt from "jsonwebtoken";

const auth = (role = null) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      if (role && decoded.role !== role) {
        return res.status(403).json({
          message: "Forbidden: Insufficient permissions",
        });
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired, please login again",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
      });
    }
  };
};

export default auth;