-- Create services table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  unit text not null, -- e.g., 'kg', 'pcs', 'meter'
  category text, -- e.g., 'Wash & Fold', 'Dry Clean'
  image_url text,
  created_at timestamptz default now()
);

-- Create orders table
create table public.orders (
  id serial primary key, -- Simple ID for easier reading in manual notifications (e.g., Order #105)
  customer_name text not null,
  customer_phone text not null,
  items jsonb not null, -- Array of {name, quantity, price, unit}
  total_price numeric not null,
  status text check (status in ('pending', 'processing', 'completed', 'paid')) default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.orders enable row level security;

-- Create policies (Simplistic for now: Public Read, Authenticated Write)
-- Services: Everyone can view, only authenticated users (admin) can edit
create policy "Public services are viewable by everyone"
  on public.services for select
  using (true);

create policy "Users can insert services"
  on public.services for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update services"
  on public.services for update
  using (auth.role() = 'authenticated');

create policy "Users can delete services"
  on public.services for delete
  using (auth.role() = 'authenticated');

-- Orders: Only authenticated users (admin) can view/edit everything
-- (For a real SaaS, users might see their own, but here it's admin-centric management)
create policy "Authenticated users can view orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert orders"
  on public.orders for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update orders"
  on public.orders for update
  using (auth.role() = 'authenticated');
