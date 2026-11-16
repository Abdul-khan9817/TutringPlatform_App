import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-extrabold text-brand-200 leading-none mb-6 select-none"
          aria-hidden="true"
        >
          404
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Let us take you somewhere useful.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"><Button>Go Home</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  )
}
