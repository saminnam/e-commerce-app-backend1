import jwt from "jsonwebtoken";

const auth = (role) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Assign decoded data to req.user
    // Ensure your JWT payload contains { id, role }
    req.user = decoded; 

    // 2. Role Authorization Logic
    // If you pass 'user' to the middleware, ensure the token's role matches
    if (role && req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    
    // Handle expired vs invalid tokens differently for better UX
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;