import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react"; // Added from LoginCard
import { X } from "lucide-react"; // Added from LoginCard

// Interface for props, including onClose from LoginCard
interface AuthCardProps {
  onClose?: () => void;
  initialMode?: "login" | "signup"; // Optional: to set the initial view
}

export default function AuthCard({ onClose, initialMode = "login" }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Added username state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Kept for signup
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added from LoginCard

  // Combined handleSubmit for login and signup
  const handleSubmit = async () => {
    setIsLoading(true);
    if (!isLogin) { // Handle Sign Up
      if (!username.trim()) {
        alert("Username is required.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      
      // Add password validation
      if (!password.trim()) {
        alert("Password cannot be empty");
        setIsLoading(false);
        return;
      }
      
      try {
        const signUpResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password }), // Include username in request
        });

        const data = await signUpResponse.json();

        if (!signUpResponse.ok) {
          throw new Error(data.error || "Sign up failed");
        }

        // After successful sign-up, automatically sign them in
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          console.error("Login after signup failed:", result.error);
          alert("Signup was successful, but login failed: " + result.error);
        } else {
          onClose?.(); // Close modal on successful login after signup
        }
      } catch (error) {
        console.error("Sign up error:", error);
        alert(`Sign up failed: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    } else { // Handle Login
      // Add password validation
      if (!password.trim()) {
        alert("Password cannot be empty");
        setIsLoading(false);
        return;
      }

      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          console.error("Login failed:", result.error);
          alert("Login failed: " + result.error);
        } else if (result?.ok) {
          console.log("Login successful");
          onClose?.();
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An unexpected error occurred during login.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error("Google login error:", error);
      alert("An unexpected error occurred during Google login.");
      setIsLoading(false);
    }
  };

  // Function to toggle between Login and Sign Up, and clear passwords
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword("");
    setConfirmPassword("");
    setUsername(""); // Clear username on mode switch
  };

  return (
    // Using fixed positioning and background overlay from LoginCard
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6 relative">
        {/* Close button from LoginCard */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "loginForm" : "signupForm"} // Changed key for clarity
              initial={{ opacity: 0, y: isLogin ? -20 : 20 }} // Added subtle y animation
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLogin ? 20 : -20 }} // Added subtle y animation
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading} // Disable input when loading
                  autoComplete="email"
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading} // Disable input when loading
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {!isLogin && ( // Show Confirm Password only on Sign Up
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading} // Disable input when loading
                    autoComplete="new-password"
                  />
                </div>
              )}

              {isLogin && ( // Show "Remember me" and "Forgot password" only on Login
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={() => setRememberMe(!rememberMe)}
                      disabled={isLoading} // Disable checkbox when loading
                    />
                    <Label htmlFor="remember-me" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <button
                    className="text-sm text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isLoading} // Disable button when loading
              >
                {isLoading
                  ? isLogin
                    ? "Logging in..."
                    : "Creating account..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <hr className="flex-grow border-gray-300" /> {/* Added line */}
                <span className="text-sm text-gray-500">or</span>
                <hr className="flex-grow border-gray-300" /> {/* Added line */}
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={isLoading} // Disable button when loading
              >
                <FcGoogle size={20} /> Continue with Google
              </Button>

              <div className="text-center text-sm text-gray-600">
                {isLogin ? (
                  <span>
                    Don't have an account?{" "}
                    <button
                      className="text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={toggleAuthMode}
                      disabled={isLoading}
                    >
                      Sign Up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      className="text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={toggleAuthMode}
                      disabled={isLoading}
                    >
                      Login
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}