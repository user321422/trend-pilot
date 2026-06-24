import { Router } from "express";
import { z } from "zod";
import { register, login } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().min(1, "Email/Username required"),
  password: z.string().min(1, "Password required"),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    req.body = result.data;
    next();
  };
}

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;