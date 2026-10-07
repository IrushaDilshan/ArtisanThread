import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ArtisanDashboardScreen = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Active Crafts', val: '24', icon: '🏺' },
    { label: 'Orders Pending', val: '7', icon: '⏳' },
    { label: 'Monthly Sales', val: 'LKR 384,000', icon: '📈' },
    { label: 'Artisan Rating', val: '4.9★', icon: '✨' },
  ];

  const recentOrders = [
    { id: '#AT-1049', item: 'Indigo Silk Scarf (Qty 2)', buyer: 'Maya Lin', status: 'Needs Packaging' },
    { id: '#AT-1048', item: 'Ceramic Matcha Bowl', buyer: 'Julian Moore', status: 'Ready for Courier' },
  ];

  // Interactive Inventory & Stock state with real photo URLs
  const [inventory, setInventory] = useState([
    {
      id: '1',
      name: 'Indigo Silk Scarf',
      price: 'LKR 12,500',
      rawPrice: '12500',
      stock: 14,
      inStock: true,
      description: '100% pure Mulberry silk hand-dyed with organic botanical indigo using traditional Sri Lankan batik techniques.',
      sizes: ['S', 'M', 'L'],
      photo: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
    },
    {
      id: '2',
      name: 'Ceramic Matcha Bowl',
      price: 'LKR 8,500',
      rawPrice: '8500',
      stock: 5,
      inStock: true,
      description: 'Hand-thrown stoneware ceremonial matcha bowl finished with a rustic wabi-sabi iron glaze.',
      sizes: ['M', 'L'],
      photo: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
    },
    {
      id: '3',
      name: 'Sashiko Coaster Set',
      price: 'LKR 4,200',
      rawPrice: '4200',
      stock: 0,
      inStock: false,
      description: 'Set of 4 hand-stitched sashiko geometric embroidery coasters on unbleached natural cotton canvas.',
      sizes: ['S', 'M'],
      photo: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400',
    },
    {
      id: '4',
      name: 'Hand-carved Teak Stool',
      price: 'LKR 24,000',
      rawPrice: '24000',
      stock: 3,
      inStock: true,
      description: 'Solid reclaimed Sri Lankan teak wood stool, hand-carved with traditional floral motifs and natural beeswax finish.',
      sizes: ['L', 'XL'],
      photo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400',
    },
  ]);

  // Modal Popup Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('1');
  const [itemDescription, setItemDescription] = useState('');
  const [itemSizes, setItemSizes] = useState(['S', 'M', 'L']);
  const [itemPhoto, setItemPhoto] = useState('');

  const toggleStock = (id, value) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = value ? (item.stock === 0 ? 5 : item.stock) : 0;
          return { ...item, inStock: value, stock: newStock };
        }
        return item;
      })
    );
  };

  const incrementStock = (id) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.stock + 1;
          return { ...item, stock: newStock, inStock: true };
        }
        return item;
      })
    );
  };

  const decrementStock = (id) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock - 1);
          return { ...item, stock: newStock, inStock: newStock > 0 };
        }
        return item;
      })
    );
  };

  const openEditModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemPrice(item.rawPrice || item.price.replace(/[^0-9.]/g, ''));
      setItemStock(String(item.stock));
      setItemDescription(item.description || '');
      setItemSizes(item.sizes || ['S', 'M', 'L']);
      setItemPhoto(item.photo || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemPrice('');
      setItemStock('1');
      setItemDescription('');
      setItemSizes(['S', 'M', 'L']);
      setItemPhoto('');
    }
    setModalVisible(true);
  };

  const toggleSizeSelection = (size) => {
    setItemSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handlePickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Media library access is required to choose craft photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setItemPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error picking image from library:', err);
      Alert.alert('Image Selection Failed', 'Could not open media library.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera access is required to take photos of your craft.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setItemPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error taking photo with camera:', err);
      Alert.alert('Camera Failed', 'Could not access device camera.');
    }
  };

  const handleSaveItem = () => {
    if (!itemName.trim() || !itemPrice.trim()) {
      Alert.alert('Validation Error', 'Please enter both item name and price.');
      return;
    }

    const cleanPriceVal = itemPrice.replace(/[^0-9.]/g, '');
    const numPrice = parseFloat(cleanPriceVal) || 0;
    const formattedPriceStr = `LKR ${numPrice.toLocaleString()}`;
    const numStock = parseInt(itemStock, 10) || 0;

    const finalPhoto = itemPhoto || 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400';

    if (editingItem) {
      // Update existing item
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              name: itemName.trim(),
              price: formattedPriceStr,
              rawPrice: cleanPriceVal,
              stock: numStock,
              inStock: numStock > 0,
              description: itemDescription.trim(),
              sizes: itemSizes,
              photo: finalPhoto,
            };
          }
          return item;
        })
      );
    } else {
      // Add new item
      const newItem = {
        id: Date.now().toString(),
        name: itemName.trim(),
        price: formattedPriceStr,
        rawPrice: cleanPriceVal,
        stock: numStock,
        inStock: numStock > 0,
        description: itemDescription.trim(),
        sizes: itemSizes.length > 0 ? itemSizes : ['M'],
        photo: finalPhoto,
      };
      setInventory((prev) => [newItem, ...prev]);
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={user?.artisanName || 'Artisan Dashboard'}
        subtitle="Craftsmanship overview & workshop activity"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <Card key={idx} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={styles.metricVal}>{m.val}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </Card>
          ))}
        </View>

        {/* Artisan Craftsmanship Status */}
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeTag}>COURIER PICKUP WINDOW</Text>
          <Text style={styles.noticeTitle}>Courier Scheduled Today at 4:00 PM</Text>
          <Text style={styles.noticeDesc}>
            Driver Marcus Vance will arrive to collect 3 packaged parcel orders.
          </Text>
        </Card>

        {/* Inventory and Stock Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inventory and Stock</Text>
          <Text style={styles.sectionHint}>Tap item card to view & edit details</Text>
        </View>

        <View style={styles.inventoryList}>
          {inventory.map((item) => (
            <Card key={item.id} style={styles.inventoryCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openEditModal(item)}
              >
                <View style={styles.invTopRow}>
                  <View style={styles.photoContainer}>
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.itemPhoto} resizeMode="cover" />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>📷</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.invInfo}>
                    <Text style={styles.invName}>{item.name}</Text>
                    <Text style={styles.invPrice}>{item.price}</Text>

                    {/* Available Sizes preview */}
                    {item.sizes && item.sizes.length > 0 && (
                      <View style={styles.sizePillRow}>
                        {item.sizes.map((sz) => (
                          <View key={sz} style={styles.sizeMiniPill}>
                            <Text style={styles.sizeMiniText}>{sz}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* In Stock / Out of Stock Toggle Switch */}
                  <View style={styles.toggleContainer}>
                    <Text
                      style={[
                        styles.toggleLabel,
                        item.inStock ? styles.labelInStock : styles.labelOutOfStock,
                      ]}
                    >
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                    <Switch
                      value={item.inStock}
                      onValueChange={(val) => toggleStock(item.id, val)}
                      trackColor={{ false: '#E0E0E0', true: COLORS.primaryMuted }}
                      thumbColor={item.inStock ? COLORS.primary : '#9E9E9E'}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Stock Counter Controls (+ and -) */}
              <View style={styles.stockControlRow}>
                <TouchableOpacity
                  onPress={() => openEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editBtnLink}>✏️ Edit Item Details</Text>
                </TouchableOpacity>

                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => decrementStock(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.stock}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => incrementStock(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Recent Inquiries & Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artisan Orders To Fulfill</Text>
        </View>

        <View style={styles.ordersList}>
          {recentOrders.map((ord) => (
            <Card key={ord.id} style={styles.orderRow}>
              <View>
                <Text style={styles.ordId}>{ord.id}</Text>
                <Text style={styles.ordItem}>{ord.item}</Text>
                <Text style={styles.ordBuyer}>Client: {ord.buyer}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{ord.status}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) on Bottom-Right Corner */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openEditModal(null)}
        activeOpacity={0.88}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Add Item</Text>
      </TouchableOpacity>

      {/* Item Details Pop-up Modal Window */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingItem ? 'Edit Item Details' : 'Add New Craft Item'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingItem
                    ? 'Update craft details, available sizes & stock count'
                    : 'List a new handcrafted piece in your inventory'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalFormScroll}>
              {/* Photo & Image Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Craft Photo *</Text>
                <View style={styles.photoPickerContainer}>
                  <View style={styles.photoPreviewBox}>
                    {itemPhoto ? (
                      <Image source={{ uri: itemPhoto }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.noPhotoBox}>
                        <Text style={styles.noPhotoIcon}>📷</Text>
                        <Text style={styles.noPhotoText}>No Photo Selected</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.photoActionButtons}>
                    <TouchableOpacity
                      style={styles.photoBtnPrimary}
                      onPress={handleTakePhoto}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoBtnPrimaryText}>📷 Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.photoBtnSecondary}
                      onPress={handlePickFromGallery}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoBtnSecondaryText}>🖼️ Choose from Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Item Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Item Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Indigo Silk Scarf"
                  value={itemName}
                  onChangeText={setItemName}
                />
              </View>

              {/* Price & Stock Row */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1.2 }]}>
                  <Text style={styles.fieldLabel}>Price (LKR) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="12500"
                    keyboardType="numeric"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 0.8 }]}>
                  <Text style={styles.fieldLabel}>Stock Quantity *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="5"
                    keyboardType="numeric"
                    value={itemStock}
                    onChangeText={setItemStock}
                  />
                </View>
              </View>

              {/* Available Sizes (XS, S, M, L, XL, XXL) */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Available Sizes (XS, S, M, L, XL, XXL)</Text>
                <View style={styles.sizeSelectionRow}>
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = itemSizes.includes(sz);
                    return (
                      <TouchableOpacity
                        key={sz}
                        onPress={() => toggleSizeSelection(sz)}
                        style={[
                          styles.sizePillOption,
                          isSelected && styles.sizePillOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sizePillOptionText,
                            isSelected && styles.sizePillOptionTextSelected,
                          ]}
                        >
                          {sz}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Craft Description */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Craft Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Details on materials, handloom weave, dye process, or dimensions..."
                  multiline
                  numberOfLines={4}
                  value={itemDescription}
                  onChangeText={setItemDescription}
                />
              </View>
            </ScrollView>

            {/* Modal Actions Footer */}
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={editingItem ? 'Save Changes' : 'Add to Inventory'}
                variant="primary"
                onPress={handleSaveItem}
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
    paddingBottom: 90,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  metricCard: {
    width: '48%',
    padding: SPACING.md,
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: '#FAF5EE',
    borderColor: '#E8D8C3',
    marginVertical: 14,
    padding: SPACING.md,
  },
  noticeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8D5B28',
    letterSpacing: 0.8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A341D',
    marginTop: 4,
  },
  noticeDesc: {
    fontSize: 12,
    color: '#6E553D',
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionHint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Inventory and Stock Styles
  inventoryList: {
    gap: 10,
    marginBottom: 8,
  },
  inventoryCard: {
    padding: SPACING.md,
  },
  invTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    marginRight: 12,
  },
  itemPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 22,
  },
  invInfo: {
    flex: 1,
    paddingRight: 8,
  },
  invName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  invPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  sizePillRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  sizeMiniPill: {
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sizeMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  labelInStock: {
    color: '#2E7D32',
  },
  labelOutOfStock: {
    color: '#D32F2F',
  },
  stockControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  editBtnLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: -2,
  },
  countBadge: {
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },

  ordersList: {
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  ordId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ordItem: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  ordBuyer: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusPill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    gap: 6,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Pop-up Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '88%',
    padding: SPACING.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalFormScroll: {
    paddingVertical: 12,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Photo Picker Section Styles
  photoPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FAFCFB',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoPreviewBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPhotoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoIcon: {
    fontSize: 22,
  },
  noPhotoText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  photoActionButtons: {
    flex: 1,
    gap: 8,
  },
  photoBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  photoBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoBtnSecondary: {
    backgroundColor: '#F0F4F3',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  photoBtnSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },

  sizeSelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizePillOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sizePillOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sizePillOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sizePillOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default ArtisanDashboardScreen;
