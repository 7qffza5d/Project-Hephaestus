import './globals.css'
import { Providers } from "./providers";
import Topbar from './components/Topbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="max-w-3xl mx-auto px-6 py-6">
        <Providers>
          <Topbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}