import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verifies the JWT and attaches req.user.
// Kicks out disabled accounts too.
export async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized — no token provided." });
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized — token is invalid or expired." });
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return res.status(401).json({ message: "User associated with this token no longer exists." });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Your account has been disabled. Contact a Super Admin." });
  }

  req.user = user;
  next();
}

// Role guard factory — use after protect.
// Example: router.get("/secret", protect, authorize("admin", "superadmin"), handler)
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Access denied. This route requires one of: ${roles.join(", ")}.`,
      });
    }
    next();
  };
}
