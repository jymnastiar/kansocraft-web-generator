import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useStore } from "@/stores/store";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const authLoading = useStore((state) => state.authLoading);
  const loginWithEmail = useStore((state) => state.loginWithEmail);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      toast.add({
        title: "Welcome back!",
        description: "You have successfully authenticated.",
        type: "success",
      });
      navigate("/");
    } catch (err: any) {
      toast.add({
        title: "Authentication failed",
        description: err.message || "Invalid credentials",
        type: "error",
      });
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative font-sans">
      {/* Background tech grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[32px_32px]" />

      <Card className="w-full max-w-md rounded-none border border-border bg-card shadow-lg z-10">
        <form onSubmit={handleLogin}>
          <CardHeader className="border-b border-border pb-4 bg-muted/20">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="size-7 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <img src="/logo.svg" alt="Logo" className="size-4" />
              </div>
              <span className="font-heading font-bold text-sm tracking-tight text-foreground">
                Kanso<span className="text-primary">Craft</span> Studio
              </span>
            </div>
            <CardTitle className="font-heading text-lg font-bold">
              Sign In to Your Workspace
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-mono">
              Access your saved applications and AI code generator
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-mono text-muted-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="developer@kansocraft.io"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-none font-mono text-xs"
                />
              </div>

              <div className="grid gap-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-mono text-muted-foreground"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3 pt-4 border-t border-border bg-muted/10">
            <Button
              disabled={authLoading}
              type="submit"
              className="w-full rounded-none bg-primary text-primary-foreground font-heading font-semibold text-xs tracking-wider uppercase h-9"
            >
              {authLoading ? "Authenticating..." : "Sign In to Studio"}
            </Button>
            <div className="text-[11px] font-mono text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Sign up here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
