import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/stores/store";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const navigate = useNavigate();
  const authLoading = useStore((state) => state.authLoading);
  const registerWithEmail = useStore((state) => state.registerWithEmail);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      await registerWithEmail(fullName, email, password);
      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }
  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleRegister}>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link className={buttonVariants({ variant: "link" })} to="/login">
              Sign in
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {errorMsg && (
            <p className="text-sm text-red-500 font-medium mb-2">{errorMsg}</p>
          )}
          <Button disabled={authLoading} type="submit" className="w-full">
            {authLoading ? "Loading..." : "Sign Up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
