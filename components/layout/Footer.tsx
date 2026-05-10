import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold">Whiskarz</h3>
            <p className="mt-2 text-sm text-white/70">
              Toronto&apos;s most trusted in-home pet care service. Professional,
              experienced, and insured pet sitters.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/services" className="text-sm text-white/70 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/service-inquiry" className="text-sm text-white/70 hover:text-white transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-white/70 hover:text-white transition-colors">
                  Signup
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-white/70">info@whiskarz.com</li>
              <li className="text-sm text-white/70">Toronto, ON, Canada</li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} Whiskarz. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
