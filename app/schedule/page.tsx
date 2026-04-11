// app/schedule/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SchedulePage from "./SchedulePage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <SchedulePage role={session.user.role} />;
}