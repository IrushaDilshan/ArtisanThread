import { supabase, isSupabaseConfigured } from './supabase';

export const productService = {
  /**
   * Fetch marketplace items with optional category or search query
   */
  async getCatalog({ category = null, searchQuery = '' } = {}) {
    return this.getProducts({ category, searchQuery });
  },

  /**
   * Fetch marketplace items with optional category or search query
   */
  async getProducts({ category = null, searchQuery = '' } = {}) {
    if (!isSupabaseConfigured) {
      return [];
    }

    let query = supabase
      .from('products')
      .select('*, profiles:artisan_id (full_name, location, avatar_url, badge)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'All' && category !== 'All Crafts') {
      query = query.eq('category', category);
    }

    if (searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch crafts belonging to a specific artisan
   */
  async getArtisanProducts(artisanId) {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new handcrafted inventory item
   */
  async createProduct(productData) {
    if (!isSupabaseConfigured) return productData;

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update existing craft details
   */
  async updateProduct(productId, updates) {
    if (!isSupabaseConfigured) return updates;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deactivate or delete product
   */
  async deleteProduct(productId) {
    if (!isSupabaseConfigured) return true;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  },
};
