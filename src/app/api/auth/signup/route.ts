import { NextResponse } from "next/server";
import { createUser } from "@/lib/database";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Additional password validation
    if (password.trim().length === 0) {
      return NextResponse.json(
        { error: "Password cannot be empty" },
        { status: 400 }
      );
    }

    // Create user with username as name
    const user = await createUser(email, password, username);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof Error && error.message === "User with this email already exists") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 