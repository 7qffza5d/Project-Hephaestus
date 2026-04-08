'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Homework', href: '/homework' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Writing',  href: '/writing' },
  { label: 'Code',     href: '/code' },
]

export default function Topbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium">Classroom hub</span>
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                pathname === link.href
                  ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => signOut()}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Log out
        </button>
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
          {initials}
        </div>
      </div>
    </nav>
  )
}