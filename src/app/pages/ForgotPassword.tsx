import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import { authController } from "../services";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await authController.sendPasswordResetEmail(email);
      if (result.success) {
        setSuccess(
          "If that email exists in our system, a password reset link has been sent. Check your inbox and spam folder."
        );
      } else {
        setError(result.error ?? "Could not send password reset email.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Reset Your Password</h1>
          <p className="mt-3 text-sm text-slate-600">
            Enter your email and we’ll send a secure reset link to help you choose a new password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="pl-10 h-12 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl transition hover:shadow-lg disabled:opacity-75"
          >
            {isLoading ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
