'use client';

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import StoreCard from '@/components/StoreCard';
import { Store, Review } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch stores
      const storesResponse = await fetch(`${API_URL}/api/stores`);
      if (!storesResponse.ok) {
        throw new Error(`Failed to fetch stores: ${storesResponse.statusText}`);
      }
      const storesData = await storesResponse.json();

      // Fetch reviews for each store
      const storesWithReviews = await Promise.all(
        storesData.map(async (store: Store) => {
          try {
            const reviewsResponse = await fetch(`${API_URL}/api/reviews/store/${store.id}`);
            const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : [];
            return {
              ...store,
              reviews: reviewsData
            };
          } catch (error) {
            console.error(`Error fetching reviews for store ${store.id}:`, error);
            return {
              ...store,
              reviews: []
            };
          }
        })
      );

      setStores(storesWithReviews);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Back to Main Page Button */}
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-bitcoin-orange text-white rounded-lg hover:bg-bitcoin-orange-dark transition-colors"
        >
          ← Back to Main Page
        </Link>
      </div>

      {/* Search Section */}
      <section className="mb-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-400 italic text-lg mb-6 font-serif">
            Don't spend your sats — exchange with class.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Stores Grid Section */}
      <section>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin-orange mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stores...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchStores}
              className="mt-4 btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No stores found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 