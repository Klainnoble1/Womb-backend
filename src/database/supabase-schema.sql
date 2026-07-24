-- ============================================================
-- WOMB Platform - Supabase Database Schema
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (Custom user profiles, separate from Supabase Auth) ──
create table if not exists womb_users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password text not null,
  role text not null default 'customer', -- customer, vendor, professional, admin
  created_at timestamptz default now()
);

-- ── Vendors ──
create table if not exists vendors (
  id serial primary key,
  user_id uuid references womb_users(id),
  company_name text not null,
  rating text default '4.9',
  location text default 'Lagos, Nigeria',
  verified boolean default true
);

-- ── Products ──
create table if not exists products (
  id serial primary key,
  vendor_id int references vendors(id),
  name text not null,
  category text not null, -- lighting, audio, lasers, staging
  price numeric(12, 2) not null,
  image text not null,
  description text default '',
  brand text default 'Womb Partner',
  stock int default 10,
  created_at timestamptz default now()
);

-- ── Rentals ──
create table if not exists rentals (
  id serial primary key,
  item_name text not null,
  category text not null,
  daily_rate numeric(12, 2) not null,
  image text not null,
  location text default 'Lagos, Nigeria',
  available boolean default true
);

-- ── Projects (Stage RFPs) ──
create table if not exists projects (
  id serial primary key,
  title text not null,
  event_type text not null,
  budget numeric(12, 2) not null,
  location text not null,
  description text,
  status text default 'Open for Bids',
  contact_name text,
  contact_phone text,
  contact_email text
);

alter table projects add column if not exists contact_name text;
alter table projects add column if not exists contact_phone text;
alter table projects add column if not exists contact_email text;

-- â”€â”€ Project Bids (Vendor-only proposals) â”€â”€
create table if not exists project_bids (
  id serial primary key,
  project_id int references projects(id) on delete cascade,
  vendor_id int,
  vendor_email text not null,
  amount numeric(12, 2) not null,
  message text not null,
  status text default 'Submitted',
  created_at timestamptz default now()
);

-- ── Professionals ──
create table if not exists professionals (
  id serial primary key,
  name text not null,
  role text not null,
  hourly_rate numeric(10, 2) not null,
  avatar text not null,
  rating text default '5.0',
  projects_completed int default 0
);

-- ── Orders ──
create table if not exists orders (
  id serial primary key,
  user_id uuid references womb_users(id),
  email text,
  total_amount numeric(12, 2) not null,
  paystack_reference text unique,
  cart_items jsonb default '[]'::jsonb,
  status text default 'pending', -- pending, paid, shipped, cancelled
  created_at timestamptz default now()
);

alter table orders add column if not exists cart_items jsonb default '[]'::jsonb;

-- ── Row Level Security (RLS) Policies ──
-- Allow public read access to marketplace tables
alter table products enable row level security;
alter table rentals enable row level security;
alter table projects enable row level security;
alter table professionals enable row level security;
alter table project_bids enable row level security;
alter table vendors enable row level security;
alter table orders enable row level security;
alter table womb_users enable row level security;

-- Public can read products, rentals, projects, professionals
create policy "Public can read products" on products for select using (true);
create policy "Public can read rentals" on rentals for select using (true);
create policy "Public can read projects" on projects for select using (true);
create policy "Public can read professionals" on professionals for select using (true);
create policy "Public can read vendors" on vendors for select using (true);

-- Contact fields are admin/backend-only even if public project rows are readable.
revoke select (contact_name, contact_phone, contact_email) on projects from anon, authenticated;

-- Service role can do everything (backend uses service_role key)
-- These are automatically bypassed with service_role key

-- ── Seed Sample Data ──
insert into products (vendor_id, name, category, price, image, description, brand, stock) values
  (null, 'BeamX 350W BWS Moving Head Light', 'lighting', 450000.00, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', 'Ultra-bright 350W hybrid moving head beam fixture for arena concerts and stage events.', 'Chauvet Pro', 12),
  (null, 'Acoustics K2 Dual 12-inch Line Array Speaker', 'audio', 1850000.00, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', 'High-power dual 12" touring line array enclosure with crystal clear throw distance.', 'L-Acoustics', 8),
  (null, 'CyberLaser 20W RGB High Power Projector', 'lasers', 1200000.00, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 'Full color 20-Watt RGB diode laser system with Pangolin FB4 control built-in.', 'Kvant', 5),
  (null, 'ProTruss Aluminum Concert Stage System (10m x 8m)', 'staging', 3500000.00, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', 'Heavy duty F34 aluminum square truss stage roof system with chain hoists.', 'Global Truss', 3)
on conflict do nothing;

insert into rentals (item_name, category, daily_rate, image, location, available) values
  ('MA Lighting grandMA3 Light Console (Rental)', 'lighting', 150000.00, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', 'Lagos, Nigeria', true),
  ('DiGiCo SD10 Digital Live Mixing Console', 'audio', 220000.00, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', 'Abuja, Nigeria', true)
on conflict do nothing;

insert into projects (title, event_type, budget, location, description, status) values
  ('Neon Pulse Festival 2026 Stage Lighting', 'Music Festival', 15000000.00, 'Eko Atlantic, Lagos', 'Seeking full stage lighting rig, pixel mapping, and laser control team for 20,000 capacity festival.', 'Open for Bids'),
  ('Corporate Excellence Awards Audio & LED Rig', 'Corporate Event', 6500000.00, 'Transcorp Hilton, Abuja', 'Requires P2.5 indoor LED wall screens, line array audio, and podium lighting setup.', 'Open for Bids')
on conflict do nothing;

insert into professionals (name, role, hourly_rate, avatar, rating, projects_completed) values
  ('Tunde Adeleke', 'Senior Lighting Designer (LD)', 35000.00, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', '5.0', 68),
  ('Emeka Nwosu', 'FOH Sound Engineer', 40000.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '4.9', 85)
on conflict do nothing;
