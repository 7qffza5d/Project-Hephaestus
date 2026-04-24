import { auth } from "@/auth";
import { redirect } from "next/navigation";
import WritingPage from "./WritingPage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <WritingPage role={session.user.role} userId={session.user.id} />;
}