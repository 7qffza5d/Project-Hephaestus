// app/homework/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeworkPage from "./HomeworkPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <HomeworkPage userId={session.user.id} role={session.user.role} />;
}