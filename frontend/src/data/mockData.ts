import { Store, Review } from '@/types';

export const mockStores: Store[] = [
  {
    id: '0f603e72-af32-4acd-9161-d5f7e4e80cd3',
    name: 'Microstrategy',
    description: 'The Bitcoin Bank',
    category: 'finance',
    btc_address: 'bc1qdrlj2w3ku5nuzvl0f4c7ug6jrl0l2dhdkllvyq',
    verified: true,
    website: 'https://www.microstrategy.com',
    reviews: [
      {
        id: '7fc3c3b6-b709-430c-9213-54a4ae1b1104',
        store_id: '0f603e72-af32-4acd-9161-d5f7e4e80cd3',
        rating: 4,
        comment: 'A forward-thinking company for Bitcoiners.',
        txid: 'txid_microstrategy_001',
        created_at: '2025-04-19T14:20:38.749879+00:00',
        updated_at: '2025-04-19T14:20:38.749879+00:00',
        verified: false
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  },
  {
    id: '9620f427-2b24-4089-ac35-65dd470e4c1d',
    name: 'Mercado Libre',
    description: 'Buy and sell products with Bitcoin',
    category: 'retail',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    website: 'https://www.mercadolibre.com',
    verified: true,
    reviews: [
      {
        id: '2a433de2-12c4-44af-80d2-274f5e308b54',
        store_id: '9620f427-2b24-4089-ac35-65dd470e4c1d',
        rating: 5,
        comment: 'once I bought a yatch using ML, paid fully with btc.',
        txid: '63999a91fe784f0b797c93048c4a29a913c30a4cc771f47b74657df3651fd0ff',
        created_at: '2025-04-20T01:53:47.159978+00:00',
        updated_at: '2025-04-20T01:56:25.817839+00:00',
        verified: true
      },
      {
        id: '92bb2061-288b-4263-ac02-f849ecc6b679',
        store_id: '9620f427-2b24-4089-ac35-65dd470e4c1d',
        rating: 1,
        comment: 'Bought an AUDI R8 using btc, got a 1:30 scale at the price of a real one. scammed :(',
        txid: '63999a91fe784f0b797c93048c4a29a913c30a4cc771f47b74657df3651fd0ff',
        created_at: '2025-04-20T02:04:44.178701+00:00',
        updated_at: '2025-04-20T02:04:44.178701+00:00',
        verified: false
      },
      {
        id: 'ea5850dd-a97f-48af-9698-a08db5d74c1b',
        store_id: '9620f427-2b24-4089-ac35-65dd470e4c1d',
        rating: 3,
        comment: 'bought an ipod using btc. works perfectly!',
        txid: '63999a91fe784f0b797c93048c4a29a913c30a4cc771f47b74657df3651fd0ff',
        created_at: '2025-04-20T02:12:56.537861+00:00',
        updated_at: '2025-04-20T02:12:56.537861+00:00',
        verified: true
      },
      {
        id: '60dd81bc-bfa8-4f99-a9a5-7f4745bb7f77',
        store_id: '9620f427-2b24-4089-ac35-65dd470e4c1d',
        rating: 1,
        comment: "If could I'll give a 0",
        txid: '63999a91fe784f0b797c93048c4a29a913c30a4cc771f47b74657df3651fd0ff',
        created_at: '2025-04-20T02:58:02.599449+00:00',
        updated_at: '2025-04-20T02:58:02.599449+00:00',
        verified: true
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  },
  {
    id: '69f846ce-883e-4ad6-8b7f-6432f578a4cb',
    name: 'Travala',
    description: 'Book flights and hotels with Bitcoin',
    category: 'travel',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    verified: true,
    reviews: [
      {
        id: '43b65a3d-0263-428b-96b7-ccf19715d6de',
        store_id: '69f846ce-883e-4ad6-8b7f-6432f578a4cb',
        rating: 4,
        comment: 'Great travel deals and smooth BTC payments!',
        txid: 'txid_travala_001',
        created_at: '2025-04-19T14:20:38.749879+00:00',
        updated_at: '2025-04-19T14:20:38.749879+00:00',
        verified: false
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  },
  {
    id: '0ce6a5bd-cb3e-4c6e-b95a-bcc47a9dba79',
    name: 'CheapAir',
    description: 'Book flights with Bitcoin',
    category: 'travel',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    verified: true,
    reviews: [
      {
        id: '5538f4c5-e4cc-4603-964e-709756a2a285',
        store_id: '0ce6a5bd-cb3e-4c6e-b95a-bcc47a9dba79',
        rating: 5,
        comment: 'Booking with Bitcoin was super smooth!',
        txid: 'txid_cheapair_001',
        created_at: '2025-04-19T14:20:38.749879+00:00',
        updated_at: '2025-04-19T14:20:38.749879+00:00',
        verified: false
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  },
  {
    id: 'e231fdea-4a98-4411-8722-7aef81c8f0a1',
    name: 'Newegg',
    description: 'Electronics and computer parts retailer',
    category: 'retail',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    verified: true,
    reviews: [
      {
        id: 'b5f97da8-baa9-492f-bd5e-0e04567be6bd',
        store_id: 'e231fdea-4a98-4411-8722-7aef81c8f0a1',
        rating: 4,
        comment: 'Electronics and Bitcoin? Yes, please.',
        txid: 'txid_newegg_001',
        created_at: '2025-04-19T14:20:38.749879+00:00',
        updated_at: '2025-04-19T14:20:38.749879+00:00',
        verified: false
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  },
  {
    id: 'f8b4f61b-cf5b-4e5a-b1be-e3421343e1fb',
    name: 'Starbucks',
    description: 'Coffee chain with Bitcoin payment option',
    category: 'food',
    btc_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    verified: true,
    reviews: [
      {
        id: '9c85bf0a-3e02-4b97-b287-4242d107b9b4',
        store_id: 'f8b4f61b-cf5b-4e5a-b1be-e3421343e1fb',
        rating: 3,
        comment: 'Needed an app to pay, but it worked.',
        txid: 'txid_starbucks_001',
        created_at: '2025-04-19T14:20:38.749879+00:00',
        updated_at: '2025-04-19T14:20:38.749879+00:00',
        verified: false
      }
    ],
    created_at: '2025-04-14T22:00:49.335936+00:00',
    updated_at: '2025-04-18T22:54:22.930223+00:00'
  }
]; 