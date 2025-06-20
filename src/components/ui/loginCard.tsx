import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { signIn } from "next-auth/react"; 
import { X } from "lucide-react"; 
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";

// Interface for props, including onClose from LoginCard
interface AuthCardProps {
  onClose?: () => void;
  initialMode?: "login" | "signup"; // Optional: to set the initial view
}

export default function AuthCard({ onClose, initialMode = "login" }: AuthCardProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // Added username state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Kept for signup
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added from LoginCard
  const [error, setError] = useState("");
  const router = useRouter();

  // Combined handleSubmit for login and signup
  const handleSubmit = async () => {
    setIsLoading(true);
    if (!isLogin) { // Handle Sign Up
      if (!username.trim()) {
        alert(t('usernameRequired'));
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        alert(t('passwordsDoNotMatch'));
        setIsLoading(false);
        return;
      }
      
      // Add password validation
      if (!password.trim()) {
        alert(t('passwordCannotBeEmpty'));
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
          throw new Error(data.error || t('signUpFailed'));
        }

        // After successful sign-up, automatically sign them in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidEmailOrPassword'));
      } else if (result?.ok) {
        router.push("/dashboard/seller/dashboard");
      } else {
          onClose?.(); // Close modal on successful login after signup
        }
      } catch (error) {
        console.error("Sign up error:", error);
        alert(`${t('signUpFailed')}: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    } else { // Handle Login
      // Add password validation
      if (!password.trim()) {
        alert(t('passwordCannotBeEmpty'));
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
          alert(t('loginFailed') + result.error);
        } else if (result?.ok) {
          console.log("Login successful");
          onClose?.();
      }
    } catch (error) {
      console.error("Login error:", error);
        alert(t('unexpectedErrorLogin'));
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
      alert(t('unexpectedErrorGoogleLogin'));
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-2xl rounded-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50 z-10"
            aria-label="Close"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <CardContent className="space-y-4 sm:space-y-6 p-0">
          <h2 className="text-xl sm:text-2xl font-bold text-center pt-2">
            {isLogin ? t('login') : t('signUp')}
          </h2>

          <div className="space-y-3 sm:space-y-4 transition-all duration-300 ease-in-out">
            <div>
              <Label htmlFor="email" className="text-sm">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                className="mt-1"
              />
            </div>

            {!isLogin && (
              <div className="transition-all duration-300 ease-in-out">
                <Label htmlFor="username" className="text-sm">{t('usernameLabel')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="text-sm">{t('passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="mt-1"
              />
            </div>

            {!isLogin && (
              <div className="transition-all duration-300 ease-in-out">
                <Label htmlFor="confirmPassword" className="text-sm">{t('confirmPasswordLabel')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="mt-1"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={() => setRememberMe(!rememberMe)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember-me" className="text-xs sm:text-sm">
                    {t('rememberMe')}
                  </Label>
                </div>
                <button
                  className="text-xs sm:text-sm text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('loading')}
                </div>
              ) : (
                isLogin ? t('login') : t('signUp')
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('or')}</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <FcGoogle className="w-5 h-5" />
              <span>{t('signInWithGoogle')}</span>
            </Button>

            <div className="text-center text-sm">
              <button
                onClick={toggleAuthMode}
                disabled={isLoading}
                className="text-teal-600 hover:text-teal-700 transition-colors duration-200"
              >
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}