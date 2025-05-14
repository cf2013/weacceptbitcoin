'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBitcoin, FaSearch } from 'react-icons/fa';
import StoreCard from '@/components/StoreCard';
import RegisterModal from '@/components/RegisterModal';
import { mockStores } from '@/data/mockData';

export default function Home() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stores] = useState(mockStores);

  const filteredStores = stores.filter(store => {
    const searchLower = searchQuery.toLowerCase();
    return (
      store.name.toLowerCase().includes(searchLower) ||
      (store.description?.toLowerCase().includes(searchLower) ?? false) ||
      (store.category?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="flex justify-center mb-6">
          <FaBitcoin className="text-bitcoin-orange text-6xl" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find Stores That Accept Bitcoin
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover and verify local businesses that accept Bitcoin payments. 
          Leave verified reviews based on your actual Bitcoin transactions.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/stores" className="btn btn-primary text-lg px-8 py-3">
            Browse Stores
          </Link>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="btn btn-outline text-lg px-8 py-3"
          >
            Add Your Store
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why List Your Store?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <FaBitcoin className="text-bitcoin-orange text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Accept Bitcoin</h3>
            <p className="text-gray-600">
              Join the growing number of businesses accepting Bitcoin payments
            </p>
          </div>
          <div className="text-center">
            <FaBitcoin className="text-bitcoin-orange text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Build Trust</h3>
            <p className="text-gray-600">
              Verified reviews help build trust with Bitcoin users
            </p>
          </div>
          <div className="text-center">
            <FaBitcoin className="text-bitcoin-orange text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
            <p className="text-gray-600">
              Reach new customers in the Bitcoin community
            </p>
          </div>
        </div>
      </section>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* Hackathon Statement Section */}
      <section className="py-16 bg-gray-50 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-2xl font-light text-gray-700 mb-4">
            This is a project about simplicity and inclusion.
          </p>
          <p className="text-xl text-gray-600 mb-4">
            A project made for bitcoin conference 2025 Hackathon.
          </p>
          <p className="text-2xl font-medium text-bitcoin-orange">
            A project to embrace hyperbitcoinzation.
          </p>
          <p className="mt-8 text-sm text-gray-500">
            Created from scratch and with love by{' '}
            <a 
              href="https://x.com/ITE_kar" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-bitcoin-orange hover:text-bitcoin-orange/80 transition-colors"
            >
              CF
            </a>
          </p>
        </div>
      </section>
    </div>
  );
} 