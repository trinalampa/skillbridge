import app from "../app.js";
import connectDB from "../config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Database connection failed." });
  }
}
