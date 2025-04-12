-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create stores table
create table if not exists stores (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    category text,
    btc_address text not null,
    verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create reviews table
create table if not exists reviews (
    id uuid default uuid_generate_v4() primary key,
    store_id uuid references stores(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    txid text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_stores_updated_at
    before update on stores
    for each row
    execute function update_updated_at_column();

create trigger update_reviews_updated_at
    before update on reviews
    for each row
    execute function update_updated_at_column();

-- Set up Row Level Security (RLS)
alter table stores enable row level security;
alter table reviews enable row level security;

-- Create policies
create policy "Stores are viewable by everyone"
    on stores for select
    using (true);

create policy "Reviews are viewable by everyone"
    on reviews for select
    using (true);

-- Create indexes
create index if not exists stores_btc_address_idx on stores(btc_address);
create index if not exists reviews_store_id_idx on reviews(store_id);
create index if not exists reviews_txid_idx on reviews(txid); 