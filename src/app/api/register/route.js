import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../email/route";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate name (only alphabets and spaces, minimum 2 characters)
    if (!/^[a-zA-Z\s]{2,}$/.test(name.trim())) {
      return Response.json(
        {
          error:
            "Name should contain only alphabets and spaces (minimum 2 characters)",
        },
        { status: 400 }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return Response.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return Response.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return Response.json(
        {
          error:
            "Password must contain at least one special character (!@#$%^&*)",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Convert email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password with bcrypt (12 rounds for security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with hashed password
    const user = await User.create({
      full_name: name,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "credentials",
      role: "user",
    });

    // Send welcome email
    await sendWelcomeEmail(normalizedEmail, name);

    return Response.json(
      {
        message: "User created successfully",
        user: { id: user._id, full_name: user.full_name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
