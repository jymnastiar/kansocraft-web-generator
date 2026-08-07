import { useStore } from "@/stores/store";

export default function HomePage() {
  const user = useStore((state) => state.user);
  return <main>This is home bitches {user?.name}</main>;
}
