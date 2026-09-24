import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/theme';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { RoleSwitcher } from '../../components/RoleSwitcher';

const ARTISAN_INVENTORY = [
  { id: '1', title: 'Indigo Dyed Handloom Scarf', stock: 14, price: '$84', status: 'Live' },
  { id: '2', title: 'Japanese Woven Sashiko Runner', stock: 5, price: '$110', status: 'Live' },
  { id: '3', title: 'Raw Silk Obi Belt (Limited)', stock: 2, price: '$165', status: 'Low Stock' },
  { id: '4', title: 'Botanical Indigo Tote Bag', stock: 0, price: '$48', status: 'Sold Out' },
];

export const ArtisanProductsScreen = () => {
  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Atelier Catalog"
        subtitle="Manage handcrafted pieces and production stock"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <RoleSwitcher />

        <Button
          title="+ Add New Handcrafted Piece"
          variant="primary"
          style={styles.addBtn}
          onPress={() => {}}
        />

        <View style={styles.list}>
          {ARTISAN_INVENTORY.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>Price: {item.price} • Stock: {item.stock} units</Text>
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
});

export default ArtisanProductsScreen;
