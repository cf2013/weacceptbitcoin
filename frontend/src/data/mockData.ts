import { Store, Review } from '@/types';

export const mockStores: Store[] = [
  {
    id: '1',
    name: 'Bitcoin Coffee Shop',
    description: 'A cozy coffee shop that accepts Bitcoin payments. Enjoy your favorite brew while supporting Bitcoin adoption!',
    category: 'Food & Beverage',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    verified: true,
    reviews: [
      {
        id: '1',
        rating: 5,
        comment: 'Great coffee and smooth Bitcoin payment process!',
        created_at: '2024-02-20T10:00:00Z',
        txid: '1234567890abcdef',
        store_id: '1'
      }
    ],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Crypto Bookstore',
    description: 'Your local bookstore specializing in cryptocurrency and blockchain literature. Pay with Bitcoin!',
    category: 'Retail',
    btc_address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    verified: false,
    reviews: [],
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  }
]; 