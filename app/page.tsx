export default function HomePage() {
  return (
    <main>
      <h1 className="text-xl font-medium mb-1">Welcome back</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="space-y-3">
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Pinned announcement</p>
          <p className="text-sm font-medium mb-1">Edit this to post an announcement</p>
          <p className="text-sm text-zinc-500">This content is edited directly in the code by an admin.</p>
        </div>
      </div>
    </main>
  )
}