import { supabase } from "../lib/supabase.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res
      .status(400)
      .json({ error: "Access denied. No session token provided." });
    return;
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (!user || error) {
    res
      .status(401)
      .json({ error: "Access denied. No session token provided." });
    return;
  }

  req.user = { userId: user.id };
  next();
};
