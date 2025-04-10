import React, { ReactNode } from 'react';
import Link from 'next/link';
import { FaBitcoin } from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bitcoin-dark text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <FaBitcoin className="text-bitcoin-orange" />
            <span>We Accept Bitcoin</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-bitcoin-orange transition-colors">
              Home
            </Link>
            <Link href="/stores" className="hover:text-bitcoin-orange transition-colors">
              Stores
            </Link>
            <Link href="/stores/new" className="hover:text-bitcoin-orange transition-colors">
              Add Store
            </Link>
          </nav>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-bitcoin-dark text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">We Accept Bitcoin</h3>
              <p className="text-gray-300">
                A directory of Bitcoin-accepting stores with verified reviews based on on-chain transactions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-bitcoin-orange transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className="text-gray-300 hover:text-bitcoin-orange transition-colors">
                    Stores
                  </Link>
                </li>
                <li>
                  <Link href="/stores/new" className="text-gray-300 hover:text-bitcoin-orange transition-colors">
                    Add Store
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-300">
                Have questions or suggestions? Reach out to us at{' '}
                <a href="mailto:contact@weacceptbitcoin.com" className="text-bitcoin-orange hover:underline">
                  contact@weacceptbitcoin.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} We Accept Bitcoin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 