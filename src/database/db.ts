import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side admin client — uses service_role key to bypass RLS
export const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
}

// ─── In-Memory Fallback Store (used if Supabase is unavailable during dev) ───
const STORE_PATH = path.join(__dirname, 'womb-store.json');

export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  brand: string;
  stock: number;
  created_at?: string;
}

export interface Rental {
  id: number;
  item_name: string;
  category: string;
  daily_rate: number;
  image: string;
  location: string;
  available: boolean;
}

export interface Project {
  id: number;
  title: string;
  event_type: string;
  budget: number;
  location: string;
  description: string;
  status: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface ProjectBid {
  id: number;
  project_id: number;
  vendor_id: number;
  vendor_email: string;
  amount: number;
  message: string;
  status: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id?: number | string;
  email: string;
  total_amount: number;
  paystack_reference: string;
  status: string;
  cart_items?: unknown;
  created_at: string;
}

export interface Professional {
  id: number;
  name: string;
  role: string;
  hourly_rate: number;
  avatar: string;
  rating: string;
  projects_completed: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

class LocalFallbackStore {
  products: Product[] = [];
  rentals: Rental[] = [];
  projects: Project[] = [];
  projectBids: ProjectBid[] = [];
  orders: Order[] = [];
  professionals: Professional[] = [];
  users: User[] = [];

  constructor() {
    if (fs.existsSync(STORE_PATH)) {
      try {
        const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
        this.products = data.products || [];
        this.rentals = data.rentals || [];
        this.projects = data.projects || [];
        this.projectBids = data.projectBids || [];
        this.orders = data.orders || [];
        this.professionals = data.professionals || [];
        this.users = data.users || [];
      } catch {
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  save() {
    fs.writeFileSync(
      STORE_PATH,
      JSON.stringify({ products: this.products, rentals: this.rentals, projects: this.projects, projectBids: this.projectBids, orders: this.orders, professionals: this.professionals, users: this.users }, null, 2)
    );
  }

  private seed() {
    this.products = [
      { id: 1, vendor_id: 1, name: 'BeamX 350W BWS Moving Head Light', category: 'lighting', price: 450000, image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', description: 'Ultra-bright 350W hybrid moving head beam fixture for arena concerts.', brand: 'Chauvet Pro', stock: 12 },
      { id: 2, vendor_id: 1, name: 'Acoustics K2 Dual 12" Line Array Speaker', category: 'audio', price: 1850000, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', description: 'High-power touring line array with crystal clear throw distance.', brand: 'L-Acoustics', stock: 8 },
      { id: 3, vendor_id: 2, name: 'CyberLaser 20W RGB High Power Projector', category: 'lasers', price: 1200000, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', description: 'Full color 20W RGB diode laser with Pangolin FB4 control.', brand: 'Kvant', stock: 5 },
      { id: 4, vendor_id: 2, name: 'ProTruss Aluminum Concert Stage System', category: 'staging', price: 3500000, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', description: 'Heavy duty F34 aluminum square truss stage roof system.', brand: 'Global Truss', stock: 3 },
    ];
    this.rentals = [
      { id: 1, item_name: 'MA Lighting grandMA3 Light Console (Rental)', category: 'lighting', daily_rate: 150000, image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80', location: 'Lagos, Nigeria', available: true },
      { id: 2, item_name: 'DiGiCo SD10 Digital Live Mixing Console', category: 'audio', daily_rate: 220000, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', location: 'Abuja, Nigeria', available: true },
    ];
    this.projects = [
      { id: 1, title: 'Neon Pulse Festival 2026 Stage Lighting', event_type: 'Music Festival', budget: 15000000, location: 'Eko Atlantic, Lagos', description: 'Seeking full stage lighting rig, pixel mapping, and laser control team.', status: 'Open for Bids' },
      { id: 2, title: 'Corporate Excellence Awards Audio & LED Rig', event_type: 'Corporate Event', budget: 6500000, location: 'Transcorp Hilton, Abuja', description: 'Requires P2.5 LED wall screens, line array audio, and podium lighting.', status: 'Open for Bids' },
    ];
    this.projectBids = [];
    this.orders = [];
    this.professionals = [
      { id: 1, name: 'Tunde Adeleke', role: 'Senior Lighting Designer (LD)', hourly_rate: 35000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', rating: '5.0', projects_completed: 68 },
      { id: 2, name: 'Emeka Nwosu', role: 'FOH Sound Engineer', hourly_rate: 40000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', rating: '4.9', projects_completed: 85 },
    ];
    this.users = [
      {
        id: 1,
        name: 'WOMB Admin',
        email: 'admin@womb.local',
        password: '$2a$10$elQBKRxNasewJo3L6OCO9eNThm7rbWAbbazazjrBYTV/p2ukzedWK',
        role: 'admin',
      },
    ];
    this.save();
  }
}

export const localFallback = new LocalFallbackStore();

// ─── Supabase DB helpers (with local fallback) ───

export async function dbGetProducts(filters: { category?: string; search?: string } = {}) {
  try {
    let query = getSupabase().from('products').select('*').order('created_at', { ascending: false });
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data : localFallback.products;
  } catch {
    return localFallback.products.filter(p => {
      const catMatch = !filters.category || filters.category === 'all' || p.category === filters.category;
      const searchMatch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase());
      return catMatch && searchMatch;
    });
  }
}

export async function dbGetProductById(id: number) {
  try {
    const { data, error } = await getSupabase().from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch {
    return localFallback.products.find(p => p.id === id) || null;
  }
}

export async function dbCreateProduct(product: Omit<Product, 'id' | 'created_at'>) {
  try {
    const { data, error } = await getSupabase().from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newProduct = { ...product, id: localFallback.products.length + 1, created_at: new Date().toISOString() };
    localFallback.products.unshift(newProduct);
    localFallback.save();
    return newProduct;
  }
}

export async function dbGetRentals() {
  try {
    const { data, error } = await getSupabase().from('rentals').select('*').order('id', { ascending: false });
    if (error) throw error;
    return data && data.length > 0 ? data : localFallback.rentals;
  } catch {
    return localFallback.rentals;
  }
}

export async function dbCreateRental(rental: Omit<Rental, 'id'>) {
  try {
    const { data, error } = await getSupabase().from('rentals').insert(rental).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newRental = { ...rental, id: localFallback.rentals.length + 1 };
    localFallback.rentals.unshift(newRental);
    localFallback.save();
    return newRental;
  }
}

function hideProjectContact(project: Project) {
  const { contact_name, contact_phone, contact_email, ...publicProject } = project;
  return publicProject;
}

export async function dbGetProjects(options: { includeContact?: boolean } = {}) {
  try {
    const { data, error } = await getSupabase().from('projects').select('*').order('id', { ascending: false });
    if (error) throw error;
    const projects = data && data.length > 0 ? data : localFallback.projects;
    return options.includeContact ? projects : projects.map(hideProjectContact);
  } catch {
    return options.includeContact ? localFallback.projects : localFallback.projects.map(hideProjectContact);
  }
}

export async function dbCreateProject(project: Omit<Project, 'id'>) {
  try {
    const { data, error } = await getSupabase().from('projects').insert(project).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newProject = { ...project, id: localFallback.projects.length + 1 };
    localFallback.projects.unshift(newProject);
    localFallback.save();
    return newProject;
  }
}

export async function dbCreateProjectBid(bid: Omit<ProjectBid, 'id' | 'status' | 'created_at'>) {
  const payload = {
    ...bid,
    status: 'Submitted',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await getSupabase().from('project_bids').insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newBid = { ...payload, id: localFallback.projectBids.length + 1 };
    localFallback.projectBids.unshift(newBid);
    localFallback.save();
    return newBid;
  }
}

export async function dbGetProjectBids(projectId?: number) {
  try {
    let query = getSupabase().from('project_bids').select('*').order('id', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch {
    return projectId
      ? localFallback.projectBids.filter((bid) => bid.project_id === projectId)
      : localFallback.projectBids;
  }
}

export async function dbGetProfessionals() {
  try {
    const { data, error } = await getSupabase().from('professionals').select('*').order('id', { ascending: false });
    if (error) throw error;
    return data && data.length > 0 ? data : localFallback.professionals;
  } catch {
    return localFallback.professionals;
  }
}

export async function dbCreateProfessional(professional: Omit<Professional, 'id' | 'rating' | 'projects_completed'>) {
  const payload = {
    ...professional,
    rating: 'New',
    projects_completed: 0,
  };

  try {
    const { data, error } = await getSupabase().from('professionals').insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newProfessional = { ...payload, id: localFallback.professionals.length + 1 };
    localFallback.professionals.unshift(newProfessional);
    localFallback.save();
    return newProfessional;
  }
}

export async function dbCreateOrder(order: { user_id?: number | string; email: string; total_amount: number; paystack_reference: string; status: string; cart_items?: unknown }) {
  const payload = {
    ...order,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await getSupabase().from('orders').insert(payload).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[DB Order Error]', err);
    const newOrder = { id: Date.now(), ...payload };
    localFallback.orders.unshift(newOrder);
    localFallback.save();
    return newOrder;
  }
}

export async function dbUpdateOrderStatus(reference: string, status: string) {
  try {
    const { error } = await getSupabase().from('orders').update({ status }).eq('paystack_reference', reference);
    if (error) throw error;
  } catch (err) {
    console.error('[DB Update Order Error]', err);
    const order = localFallback.orders.find((item) => item.paystack_reference === reference);
    if (order) {
      order.status = status;
      localFallback.save();
    }
  }
}

export async function dbGetOrdersByEmail(email: string) {
  try {
    const { data, error } = await getSupabase().from('orders').select('*').eq('email', email).order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return localFallback.orders.filter((order) => order.email.toLowerCase() === email.toLowerCase());
  }
}

export async function dbGetDashboardByEmail(email: string) {
  const submittedProjects = (await dbGetProjects({ includeContact: true }))
    .filter((project) => project.contact_email?.toLowerCase() === email.toLowerCase());
  const projectIds = new Set(submittedProjects.map((project) => project.id));
  const bids = (await dbGetProjectBids()).filter((bid) => projectIds.has(bid.project_id));
  const orders = await dbGetOrdersByEmail(email);

  return {
    submittedProjects,
    bids,
    orders,
  };
}

export async function dbFindUserByEmail(email: string) {
  try {
    const { data, error } = await getSupabase().from('womb_users').select('*').eq('email', email).single();
    if (error) throw error;
    return data;
  } catch {
    return localFallback.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }
}

export async function dbCreateUser(user: { name: string; email: string; password: string; role: string }) {
  try {
    const { data, error } = await getSupabase().from('womb_users').insert(user).select().single();
    if (error) throw error;
    return data;
  } catch {
    const newUser = { ...user, id: localFallback.users.length + 1 };
    localFallback.users.push(newUser);
    localFallback.save();
    return newUser;
  }
}

export async function initDatabase() {
  console.log('[DB] Supabase database client initialized.');
  console.log('[DB] Supabase URL:', process.env.SUPABASE_URL ? '✓ Connected' : '✗ Missing');
  console.log('[DB] Service Role:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Present' : '✗ Missing (fallback active)');
}
