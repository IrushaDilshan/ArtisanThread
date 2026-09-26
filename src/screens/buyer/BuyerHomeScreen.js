import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { productService, isSupabaseConfigured } from '../../services';

const CATEGORIES = ['All Crafts', 'Textiles', 'Ceramics', 'Woodcraft', 'Metalwork', 'Jewelry'];

export const BuyerHomeScreen = ({ navigation }) => {
  const [selectedCat, setSelectedCat] = useState('All Crafts');
  const [search, setSearch] = useState('');
  const [dbProducts, setDbProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const catFilter = selectedCat === 'All Crafts' ? null : selectedCat;
      const data = await productService.getCatalog({
        category: catFilter,
        searchQuery: search,
      });
      setDbProducts(data || []);
    } catch (e) {
      console.warn('Error loading products from Supabase:', e.message);
      setDbProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCat, search]);

  // Re-fetch live whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  // Strictly maps database items — no fallback mock array
  const displayedProducts = dbProducts.map((p) => ({
    id: p.id,
    title: p.title,
    artisan: p.profiles?.full_name || 'Master Artisan',
    region: p.profiles?.location || 'Craft Atelier',
    price: `$${Number(p.price || 0).toFixed(2)}`,
    tag: p.category || 'Craft',
    icon: p.category === 'Textiles' ? '🧣' : p.category === 'Ceramics' ? '🫖' : p.category === 'Woodcraft' ? '🪵' : p.category === 'Jewelry' ? '💍' : '✨',
  }));

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Artisan Marketplace"
        subtitle="Discover curated handmade crafts worldwide"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Role Switcher Bar for easy demo toggling */}
        <RoleSwitcher />

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search craft, artisan, or material..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[styles.catPill, active && styles.catPillActive]}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Story Spotlight Banner */}
        <Card style={styles.storyCard}>
          <View style={styles.storyContent}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>ARTISAN SPOTLIGHT</Text>
            </View>
            <Text style={styles.storyTitle}>The Art of Natural Indigo</Text>
            <Text style={styles.storyDesc}>
              Centuries-old botanical vat-dyeing techniques from traditional Japanese looms.
            </Text>
          </View>
        </Card>

        {/* Featured Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Curated Handcrafted Pieces</Text>
          <Text style={styles.sectionAction}>
            {loading ? 'Refreshing...' : `${displayedProducts.length} items`}
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching handcrafted pieces from Supabase...</Text>
          </View>
        ) : displayedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏺</Text>
            <Text style={styles.emptyTitle}>No Crafts Found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No crafts match "${search}". Try adjusting your search.`
                : selectedCat !== 'All Crafts'
                ? `No pieces listed under "${selectedCat}" in the database yet.`
                : 'No handcrafted pieces found in your database. Run the Supabase seed script or list a craft as an Artisan.'}
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.emptyRefreshBtn}>
              <Text style={styles.emptyRefreshBtnText}>🔄 Pull to Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {displayedProducts.map((prod) => (
              <Card key={prod.id} style={styles.productCard}>
                <View style={styles.productIconContainer}>
                  <Text style={styles.productEmoji}>{prod.icon}</Text>
                </View>
                <Text style={styles.productTag}>{prod.tag}</Text>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {prod.title}
                </Text>
                <Text style={styles.artisanName}>by {prod.artisan}</Text>
                <Text style={styles.productRegion}>{prod.region}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{prod.price}</Text>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  catTextActive: {
    color: '#FFF',
  },
  storyCard: {
    backgroundColor: '#00332C',
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
  },
  storyContent: {},
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgePillText: {
    color: '#80CBC4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  storyDesc: {
    fontSize: 13,
    color: '#B2DFDB',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  productIconContainer: {
    height: 90,
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  productEmoji: {
    fontSize: 42,
  },
  productTag: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
    minHeight: 36,
  },
  artisanName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  productRegion: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyRefreshBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyRefreshBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default BuyerHomeScreen;
