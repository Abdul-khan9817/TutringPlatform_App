import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
