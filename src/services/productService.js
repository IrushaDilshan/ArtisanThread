import { supabase, isSupabaseConfigured } from './supabase';
import { safeStorage } from './storageHelper';

const STORAGE_KEY = 'ARTISAN_THREAD_CUSTOM_PRODUCTS';
const DELETED_STORAGE_KEY = 'ARTISAN_THREAD_DELETED_PRODUCT_IDS';

export const SEEDED_CATALOG = [
  {
    id: 'indigo-dress',
    title: 'Indigo Silk Batik Saree & Dress',
    name: 'Indigo Silk Batik Saree & Dress',
    price: '6,500',
    rawPrice: 6500,
    artisan: 'Nimali Batik Studio',
    artisan_id: 'artisan-1',
    location: 'Colombo',
    category: 'Batik Apparel',
    rating: '4.9 (22)',
    icon: '👗',
    badge: 'Best Seller',
    stock: 8,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85',
    description: '100% pure Mulberry silk hand-dyed with organic botanical indigo using traditional Sri Lankan wax-resist batik techniques.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'dumbara-bag',
    title: 'Dumbara Handloom Tote Bag',
    name: 'Dumbara Handloom Tote Bag',
    price: '4,800',
    rawPrice: 4800,
    artisan: 'Kandyan Loom House',
    artisan_id: 'artisan-2',
    location: 'Kandy',
    category: 'Handloom',
    rating: '4.8 (16)',
    icon: '🧵',
    badge: 'Heritage',
    stock: 12,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
    description: 'Authentic Dumbara mat weave pattern hand-loomed with natural unbleached cotton and dyed with indigenous tree bark.',
    sizes: ['M', 'L'],
  },
  {
    id: 'palm-storage-box',
    title: 'Matara Palm Leaf Storage Box',
    name: 'Matara Palm Leaf Storage Box',
    price: '2,950',
    rawPrice: 2950,
    artisan: 'Matara Craft Circle',
    artisan_id: 'artisan-3',
    location: 'Matara',
    category: 'Handicrafts',
    rating: '4.9 (31)',
    icon: '📦',
    badge: 'Eco Friendly',
    stock: 15,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85',
    description: 'Hand-woven storage basket crafted from dried palm fronds by coastal artisan communities in Matara.',
    sizes: ['Standard'],
  },
  {
    id: 'lacquer-elephant',
    title: 'Handcarved Lacquer Wooden Elephant',
    name: 'Handcarved Lacquer Wooden Elephant',
    price: '3,200',
    rawPrice: 3200,
    artisan: 'Laksha Artisans',
    artisan_id: 'artisan-4',
    location: 'Galle',
    category: 'Woodcraft',
    rating: '4.8 (12)',
    icon: '🐘',
    badge: 'Masterpiece',
    stock: 6,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=900&q=85',
    description: 'Traditional Sri Lankan elephant statuette hand-turned and coated with vibrant natural lacquer tree resin.',
    sizes: ['Small', 'Medium'],
  },
  {
    id: 'terracotta-pot',
    title: 'Traditional Terracotta Cooking Pot',
    name: 'Traditional Terracotta Cooking Pot',
    price: '2,400',
    rawPrice: 2400,
    artisan: 'Kelaniya Clay Potters',
    artisan_id: 'artisan-5',
    location: 'Kelaniya',
    category: 'Handicrafts',
    rating: '4.9 (18)',
    icon: '🏺',
    badge: 'Natural Clay',
    stock: 9,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85',
    description: 'Unglazed earthenware terracotta cooking pot hand-shaped on potter wheels along the Kelani river valley.',
    sizes: ['2L', '3.5L'],
  },
  {
    id: 'ceylon-jewelry',
    title: 'Handcrafted Ceylon Silver Pendant',
    name: 'Handcrafted Ceylon Silver Pendant',
    price: '8,900',
    rawPrice: 8900,
    artisan: 'Ratnapura Silversmiths',
    artisan_id: 'artisan-6',
    location: 'Ratnapura',
    category: 'Jewelry',
    rating: '5.0 (27)',
    icon: '💍',
    badge: 'Pure Silver',
    stock: 4,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    description: 'Hand-filigreed solid 925 sterling silver pendant inspired by royal Kandyan heritage designs.',
    sizes: ['One Size'],
  },
];

export const productService = {
  async getStoredCustomProducts() {
    try {
      const stored = await safeStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored products:', e);
    }
    return [];
  },

  async getDeletedProductIds() {
    try {
      const stored = await safeStorage.getItem(DELETED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed.map((id) => String(id)));
        }
      }
    } catch (e) {
      console.warn('Error reading deleted products:', e);
    }
    return new Set();
  },

  async addDeletedProductId(id) {
    try {
      const deletedSet = await this.getDeletedProductIds();
      deletedSet.add(String(id));
      await safeStorage.setItem(DELETED_STORAGE_KEY, Array.from(deletedSet));
    } catch (e) {
      console.warn('Error saving deleted product id:', e);
    }
  },

  async saveStoredCustomProducts(products) {
    try {
      await safeStorage.setItem(STORAGE_KEY, products);
    } catch (e) {
      console.warn('Error saving custom products:', e);
    }
  },

  /**
   * Fetch marketplace items with optional category or search query
   */
  async getCatalog({ category = null, searchQuery = '' } = {}) {
    return this.getProducts({ category, searchQuery });
  },

  /**
   * Fetch marketplace items combining Supabase and persisted artisan products
   */
  async getProducts({ category = null, searchQuery = '' } = {}) {
    let supabaseProducts = [];

    if (isSupabaseConfigured) {
      try {
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
        if (!error && data) {
          supabaseProducts = data;
        }
      } catch (e) {
        console.warn('Supabase product query error:', e.message);
      }
    }

    const customProducts = await this.getStoredCustomProducts();

    // Map custom products into unified structure
    const mappedCustom = customProducts.map((p) => ({
      id: String(p.id),
      title: p.title || p.name,
      name: p.name || p.title,
      price: String(p.price).replace(/[^0-9.]/g, ''),
      rawPrice: Number(String(p.price).replace(/[^0-9.]/g, '')) || 0,
      artisan: p.artisan || p.profiles?.full_name || 'Master Artisan',
      artisan_id: p.artisan_id || 'artisan-custom',
      location: p.location || p.profiles?.location || 'Craft Workshop',
      category: p.category || 'Craft',
      rating: p.rating || '5.0 (New)',
      badge: p.badge || 'Artisan Direct',
      stock: p.stock !== undefined ? p.stock : 5,
      inStock: p.inStock !== undefined ? p.inStock : (p.stock > 0),
      image: p.image || p.image_url || p.photo || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      image_url: p.image_url || p.image || p.photo || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      description: p.description || '',
      sizes: p.sizes || ['M', 'L'],
      icon:
        p.category === 'Textiles' || p.category === 'Batik Apparel'
          ? '👗'
          : p.category === 'Ceramics'
            ? '🫖'
            : p.category === 'Woodcraft'
              ? '🪵'
              : p.category === 'Jewelry'
                ? '💍'
                : '✨',
    }));

    // Map Supabase products
    const mappedSupabase = supabaseProducts.map((p) => ({
      id: String(p.id),
      title: p.title,
      name: p.title,
      price: String(p.price),
      rawPrice: Number(p.price) || 0,
      artisan: p.profiles?.full_name || 'Master Artisan',
      artisan_id: p.artisan_id,
      location: p.profiles?.location || 'Craft Workshop',
      category: p.category || 'Craft',
      rating: '4.9 (Verified)',
      badge: p.profiles?.badge || 'Verified Artisan',
      stock: p.stock || 5,
      inStock: (p.stock || 5) > 0,
      image: p.image_url || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      image_url: p.image_url,
      description: p.description || '',
      sizes: ['M', 'L'],
      icon: '✨',
    }));

    // Merge: Custom products first, then Supabase, then seeded defaults (deduplicating by ID)
    const combined = [...mappedCustom, ...mappedSupabase, ...SEEDED_CATALOG];
    const seenIds = new Set();
    const deduplicated = [];

    for (const item of combined) {
      const key = String(item.id);
      if (!seenIds.has(key)) {
        seenIds.add(key);
        deduplicated.push(item);
      }
    }

    const deletedIds = await this.getDeletedProductIds();

    // Apply filtering
    const cat = category && category !== 'All' && category !== 'All Crafts' ? category.toLowerCase() : null;
    const query = searchQuery ? searchQuery.trim().toLowerCase() : '';

    return deduplicated.filter((p) => {
      if (deletedIds.has(String(p.id))) {
        return false;
      }
      const matchesCat = !cat || (p.category && p.category.toLowerCase().includes(cat));
      const matchesSearch =
        !query ||
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.artisan && p.artisan.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  },

  /**
   * Fetch crafts belonging to a specific artisan
   */
  async getArtisanProducts(artisanId) {
    const deletedIds = await this.getDeletedProductIds();
    const custom = await this.getStoredCustomProducts();
    const filteredCustom = custom.filter(
      (p) =>
        !deletedIds.has(String(p.id)) &&
        (!artisanId || !p.artisan_id || p.artisan_id === artisanId || p.artisan_id === 'artisan-custom')
    );

    if (!isSupabaseConfigured || !artisanId) {
      return filteredCustom;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Merge Supabase with custom items
        const ids = new Set(data.map((d) => String(d.id)));
        const notInSupabase = filteredCustom.filter((c) => !ids.has(String(c.id)));
        return [...notInSupabase, ...data].filter((p) => !deletedIds.has(String(p.id)));
      }
    } catch (e) {
      console.warn('Error fetching artisan products from Supabase:', e.message);
    }

    return filteredCustom;
  },

  /**
   * Create a new handcrafted inventory item
   */
  async createProduct(productData) {
    const newId = productData.id || `craft-${Date.now()}`;
    const cleanPrice = String(productData.price).replace(/[^0-9.]/g, '');
    const numPrice = parseFloat(cleanPrice) || 0;
    const stockVal = parseInt(productData.stock, 10) || 1;

    const formattedProduct = {
      ...productData,
      id: newId,
      title: productData.title || productData.name || 'Handcrafted Craft',
      name: productData.name || productData.title || 'Handcrafted Craft',
      price: numPrice,
      rawPrice: numPrice,
      stock: stockVal,
      inStock: stockVal > 0,
      category: productData.category || 'Handicrafts',
      description: productData.description || '',
      image: productData.photo || productData.image || productData.image_url || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      image_url: productData.photo || productData.image || productData.image_url || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
      artisan: productData.artisan || 'Master Artisan',
      artisan_id: productData.artisan_id || 'artisan-custom',
      created_at: new Date().toISOString(),
      is_active: true,
    };

    // Save to persistent safeStorage
    const existing = await this.getStoredCustomProducts();
    const updated = [formattedProduct, ...existing.filter((p) => p.id !== newId)];
    await this.saveStoredCustomProducts(updated);

    // Also attempt Supabase insert if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([
            {
              title: formattedProduct.title,
              category: formattedProduct.category,
              price: formattedProduct.price,
              stock: formattedProduct.stock,
              description: formattedProduct.description,
              image_url: formattedProduct.image_url,
              is_active: true,
              artisan_id: productData.artisan_id,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          formattedProduct.id = data.id;
        }
      } catch (e) {
        console.warn('Supabase insert fallback:', e.message);
      }
    }

    return formattedProduct;
  },

  /**
   * Update existing craft details
   */
  async updateProduct(productId, updates) {
    const existing = await this.getStoredCustomProducts();
    const updated = existing.map((item) =>
      item.id === productId ? { ...item, ...updates } : item
    );
    await this.saveStoredCustomProducts(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('products')
          .update(updates)
          .eq('id', productId);
      } catch (e) {
        console.warn('Supabase update fallback:', e.message);
      }
    }

    return updates;
  },

  /**
   * Deactivate or delete product
   */
  async deleteProduct(productId) {
    const strId = String(productId);
    await this.addDeletedProductId(strId);

    const existing = await this.getStoredCustomProducts();
    const updated = existing.filter((item) => String(item.id) !== strId);
    await this.saveStoredCustomProducts(updated);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) {
          // Fallback to deactivating if delete fails (e.g. Foreign Key constraints)
          await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', productId);
        }
      } catch (e) {
        console.warn('Supabase delete fallback:', e.message);
      }
    }

    return true;
  },
};

export default productService;
