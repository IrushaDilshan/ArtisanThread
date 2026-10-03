import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';
import { productService, isSupabaseConfigured } from '../../services';

export const ArtisanProductsScreen = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Craft Modal Form
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Textiles');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    if (!user?.id) {
      setInventory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await productService.getArtisanProducts(user.id);
      if (data && data.length > 0) {
        const formatted = data.map((item) => {
          let status = 'Live';
          if (item.stock === 0) status = 'Sold Out';
          else if (item.stock <= 3) status = 'Low Stock';

          return {
            id: item.id,
            title: item.title,
            stock: item.stock,
            price: `$${Number(item.price || 0).toFixed(2)}`,
            status,
            category: item.category,
          };
        });
        setInventory(formatted);
      } else {
        setInventory([]);
      }
    } catch (e) {
      console.warn('Could not load inventory from Supabase:', e.message);
      setInventory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Re-fetch live whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };

  const handleCreateCraft = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Validation Required', 'Please provide a craft title and price.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please sign in to your artisan account to publish crafts.');
      return;
    }

    try {
      setSaving(true);
      await productService.createProduct({
        artisan_id: user.id,
        title: title.trim(),
        category,
        price: parseFloat(price.replace(/[^0-9.]/g, '')),
        stock: parseInt(stock, 10) || 1,
        description: description.trim(),
        is_active: true,
      });

      Alert.alert('Success', 'Handcrafted piece added to your atelier catalog!');
      setTitle('');
      setPrice('');
      setStock('1');
      setDescription('');
      setModalVisible(false);
      loadInventory();
    } catch (err) {
      Alert.alert('Publish Failed', err.message || 'Could not save craft piece to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Atelier Catalog"
        subtitle="Manage handcrafted pieces and production stock"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <RoleSwitcher />

        <Button
          title="+ Add New Handcrafted Piece"
          variant="primary"
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        />

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching atelier inventory from Supabase...</Text>
          </View>
        ) : inventory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎨</Text>
            <Text style={styles.emptyTitle}>No Catalog Items Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't listed any handcrafted crafts in your atelier. Tap "+ Add New Handcrafted Piece" above to publish your first piece!
            </Text>
            <TouchableOpacity onPress={onRefresh} style={styles.emptyRefreshBtn}>
              <Text style={styles.emptyRefreshBtnText}>🔄 Pull to Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {inventory.map((item) => (
              <Card key={item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>
                      Price: {item.price} • Stock: {item.stock} units
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.tag,
                      item.status === 'Low Stock' && styles.tagLow,
                      item.status === 'Sold Out' && styles.tagOut,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        item.status === 'Low Stock' && styles.tagTextLow,
                        item.status === 'Sold Out' && styles.tagTextOut,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add New Craft Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Handcrafted Piece</Text>
            <Text style={styles.modalSubtitle}>List a craft for buyers on the marketplace</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Craft Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Hand-carved Walnut Stool"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="85.00"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Stock Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Textiles, Ceramics, Woodcraft, etc."
                value={category}
                onChangeText={setCategory}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Craft Description</Text>
              <TextInput
                style={[styles.input, { height: 65, textAlignVertical: 'top' }]}
                placeholder="Details on materials, glaze, or weaving..."
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Publish Craft"
                variant="primary"
                loading={saving}
                onPress={handleCreateCraft}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    marginVertical: 10,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  card: {
    padding: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  tagLow: {
    backgroundColor: '#FFF4E5',
  },
  tagTextLow: {
    color: '#ED6C02',
  },
  tagOut: {
    backgroundColor: '#FFEBEE',
  },
  tagTextOut: {
    color: '#D32F2F',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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

export default ArtisanProductsScreen;
