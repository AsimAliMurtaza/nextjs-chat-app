import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "your_jwt_secret"; // Keep this secret

export function signJwtToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "5d" });
}