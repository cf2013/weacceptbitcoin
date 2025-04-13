'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBitcoin } from 'react-icons/fa';
import StoreCard from '@/components/StoreCard';
import RegisterModal from '@/components/RegisterModal';
import { mockStores } from '@/data/mockData';

export default function Home() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
          <Link href="/stores" className="btn btn-primary">
            Browse Stores
          </Link>
          <button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="btn btn-outline"
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

      {/* Featured Stores Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Stores
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/stores" className="btn btn-primary">
            View All Stores
          </Link>
        </div>
      </section>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
} 