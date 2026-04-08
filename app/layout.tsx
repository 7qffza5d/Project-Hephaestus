import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import SessionProvider from './components/SessionProvider'
import Topbar from './components/Topbar'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="max-w-3xl mx-auto px-6 py-6">
        <SessionProvider session={session}>
          <Topbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}