/**
 * LoginPage — Polished login UI wired to AuthController.
 *
 * On success navigates to / (dashboard).
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { DollarSign, LogIn } from "lucide-react";
import { authController } from "../services";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = authController.login(email, password);

    if (result.success) {
      sessionStorage.setItem("userRole", result.role ?? "Staff");
      sessionStorage.setItem("userEmail", email);
      navigate("/");
    } else {
      setError(result.error ?? "Login failed.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-foreground">ClubZen CFMS</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Use <span className="font-medium">admin@clubzen.com</span> for Admin role,
                or any email for Staff role.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
