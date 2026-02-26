/**
 * LoginPage — Modern, interactive login UI.
 *
 * Accepts any credentials and navigates to / (dashboard).
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { DollarSign, Mail, Lock, ArrowRight } from "lucide-react";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading delay for interactive feel
    setTimeout(() => {
      sessionStorage.setItem("userEmail", email);
      navigate("/dashboard");
    }, 500);
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left Section - Branding & Message */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-40 -left-40 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-40 right-40 animate-pulse' style={{ animationDelay: '2s' }}"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">ClubZen CFMS</h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-sm mx-auto">
            Stay connected with us. Manage your finances with ease and elegance.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <span className="font-bold text-2xl text-white">ClubZen</span>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-12 text-base border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Forget Password Link */}
              <p className="text-center text-gray-600">
                Having trouble signing in?{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Reset password
                </a>
              </p>
            </form>
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-xs mt-6">
            © 2026 ClubZen CFMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
