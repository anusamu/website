const jwt = require("jsonwebtoken");

// 1. HIGH-PERFORMANCE PROTECT MIDDLEWARE
exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fast-path header check string pooling
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Faster string extraction than .split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    // Performance Optimization: Verify JWT asynchronously so it doesn't block the Node event loop
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
      
      req.user = decoded;
      next();
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Auth Error" });
  }
};

// 2. DEFENSIVE AND FAST AUTHORIZE MIDDLEWARE
exports.authorize = (...roles) => {
  // Pre-size optimization using a Set for O(1) lookups if handling multiple roles
  const allowedRoles = new Set(roles);

  return (req, res, next) => {
    // Crucial Correction: Safe navigation check to prevent system crashes if req.user is absent
    if (!req.user || !req.user.role || !allowedRoles.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};