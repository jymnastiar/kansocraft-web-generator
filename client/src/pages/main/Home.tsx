import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/store";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const user = useStore((state) => state.user);
  const authLoading = useStore((state) => state.authLoading);
  const navigate = useNavigate();

  const logoutSession = useStore((state) => state.logoutSession);
  async function handleLogout() {
    try {
      await logoutSession();
      navigate("/login");
    } catch (err: any) {
      console.error(err.message);
    }
  }
  return (
    <main>
      This is home bitches {user?.email}
      <Button disabled={authLoading} onClick={handleLogout}>
        {authLoading ? "Loading..." : "Log Out"}
      </Button>
    </main>
  );
}
