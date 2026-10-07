import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../navigation/routes';

export const BuyerProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const name = user?.name || 'Amanda Silva';
  const email = user?.email || 'amanda.silva@example.com';
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  const showMessage = (title, message) => Alert.alert(title, message);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation?.goBack?.()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={21} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => showMessage('Settings', 'Profile settings will be available here.')} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
            <View style={styles.verifiedBuyer}>
              <Ionicons name="star" size={13} color="#4D9278" />
              <Text style={styles.verifiedText}>Verified Buyer</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.statText}>12 Orders</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statText}>4.9 Rating</Text>
              </View>
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={() => navigation?.navigate?.(ROUTES.BUYER.WISHLIST)} style={styles.wishlistShortcut}>
            <Ionicons name="heart-outline" size={16} color={COLORS.primary} />
            <Text style={styles.wishlistShortcutText}>My Wishlist</Text>
            <Ionicons name="chevron-forward" size={16} color="#77817D" />
          </Pressable>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Identity &amp; Contact</Text>
            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>+94 77 123 4567</Text>
            </View>
            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>{email}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeadingRow}>
              <Ionicons name="location-outline" size={17} color={COLORS.primaryLight} />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressName}>Home</Text>
            <Text style={styles.addressText}>No. 42, Flower Road, Colombo 07, Sri Lanka</Text>
            <View style={styles.addressActions}>
              <View style={styles.defaultTag}><Text style={styles.defaultTagText}>Default</Text></View>
              <Pressable accessibilityRole="button" onPress={() => showMessage('Edit address', 'Update your saved delivery address.')}>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeadingRow}>
              <Ionicons name="card-outline" size={17} color={COLORS.primaryLight} />
              <Text style={styles.sectionTitle}>Payment Methods</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.visaMark}><Text style={styles.visaText}>VISA</Text></View>
              <View style={styles.paymentDetails}>
                <Text style={styles.cardNumber}>•••• 4242</Text>
                <Text style={styles.expiry}>Expires 12/28</Text>
              </View>
              <Text style={styles.defaultPayment}>Default</Text>
            </View>
          </View>

          <View style={[styles.sectionCard, styles.preferencesCard]}>
            <Text style={styles.sectionTitle}>Preferences &amp; Support</Text>
            <Pressable accessibilityRole="button" onPress={() => showMessage('Notifications', 'Manage your order and artisan updates.')} style={styles.linkRow}>
              <Text style={styles.linkText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={17} color="#77817D" />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => showMessage('Help Center', 'How can we help with your ArtisanThread order?')} style={[styles.linkRow, styles.lastRow]}>
              <Text style={styles.linkText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={17} color="#77817D" />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F8F7' },
  screen: { flex: 1, backgroundColor: '#F8F8F7' },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  headerButton: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ECEEEC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#161B19', fontSize: 16, fontWeight: '800' },
  content: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 14, gap: 10 },
  profileCard: { minHeight: 142, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#F0F1EF' },
  avatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 4, backgroundColor: '#E2F0EC', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  name: { color: '#171C1A', fontSize: 16, fontWeight: '800', marginTop: 0 },
  email: { color: '#8A918E', fontSize: 10, marginTop: 4 },
  verifiedBuyer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  verifiedText: { color: '#4D9278', fontSize: 9, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  statPill: { height: 25, paddingHorizontal: 11, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F4F1' },
  statText: { color: '#31756B', fontSize: 9, fontWeight: '700' },
  wishlistShortcut: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F1EF' },
  wishlistShortcutText: { flex: 1, color: '#424A46', fontSize: 10, fontWeight: '700' },
  sectionCard: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 14, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F1EF' },
  sectionTitle: { color: '#272D2A', fontSize: 11, fontWeight: '800' },
  infoRow: { minHeight: 33, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEF0EE' },
  lastRow: { borderBottomWidth: 0 },
  fieldLabel: { color: '#8A918E', fontSize: 10 },
  fieldValue: { maxWidth: '64%', color: '#29302D', fontSize: 10, fontWeight: '700' },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  addressName: { color: '#252B28', fontSize: 10, fontWeight: '700' },
  addressText: { color: '#8A918E', fontSize: 9, marginTop: 5 },
  addressActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
  defaultTag: { minHeight: 22, paddingHorizontal: 9, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7F4F0' },
  defaultTagText: { color: '#36776D', fontSize: 8, fontWeight: '700' },
  editText: { color: '#377B70', fontSize: 9, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 1 },
  visaMark: { width: 34, height: 21, borderRadius: 4, backgroundColor: '#F1F2F3', alignItems: 'center', justifyContent: 'center' },
  visaText: { color: '#25345A', fontSize: 8, fontWeight: '900', fontStyle: 'italic' },
  paymentDetails: { flex: 1 },
  cardNumber: { color: '#292F2C', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  expiry: { color: '#8A918E', fontSize: 8, marginTop: 3 },
  defaultPayment: { color: '#39766D', fontSize: 8, fontWeight: '700' },
  preferencesCard: { paddingBottom: 2 },
  linkRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEF0EE' },
  linkText: { color: '#626B67', fontSize: 10 },
});

export default BuyerProfileScreen;
