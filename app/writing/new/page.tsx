import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PostEditor from "@/app/components/PostEditor";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold text-white mb-4">New post</h1>
      <div className="flex-1 min-h-0">
        <PostEditor />
      </div>
    </div>
  );
}