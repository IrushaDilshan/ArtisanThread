import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../navigation/routes';

export const BuyerProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const rawName = user?.name || 'Sandunika';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const email = user?.email || 'sandunika@gmail.com';
  const initial = displayName.charAt(0).toUpperCase() || 'S';

  const showMessage = (title, message) => Alert.alert(title, message);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your ArtisanThread account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout?.();
            } catch (e) {
              navigation?.reset({ index: 0, routes: [{ name: ROUTES.AUTH.LOGIN }] });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation?.goBack?.()}
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => showMessage('Profile Settings', 'Account preference controls and privacy options.')}
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 110 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.verifiedCheckBadge}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
              </View>
            </View>

            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>

            <View style={styles.verifiedBuyerPill}>
              <Ionicons name="star" size={13} color="#004D40" />
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

          {/* Wishlist Shortcut Tile */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="My Wishlist"
            onPress={() => navigation?.navigate?.(ROUTES.BUYER.WISHLIST)}
            style={styles.wishlistTile}
          >
            <View style={styles.wishlistLeft}>
              <View style={styles.wishlistIconWrap}>
                <Ionicons name="heart-outline" size={18} color="#C2185B" />
              </View>
              <Text style={styles.wishlistTitle}>My Wishlist</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Identity & Contact Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Identity &amp; Contact</Text>

            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldValue}>+94 77 123 4567</Text>
            </View>

            <View style={[styles.infoRow, styles.lastRow]}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>

          {/* Delivery Address */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeadingRow}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>

            <View style={styles.addressBox}>
              <Text style={styles.addressName}>Home</Text>
              <Text style={styles.addressBody}>
                No. 42, Flower Road, Colombo 07, Sri Lanka
              </Text>

              <View style={styles.addressActions}>
                <View style={styles.defaultPill}>
                  <Text style={styles.defaultPillText}>Default</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => showMessage('Edit Address', 'Update your saved delivery address.')}
                  style={styles.editBtn}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeadingRow}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Payment Methods</Text>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.visaBadge}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.cardNumber}>•••• 4242</Text>
                <Text style={styles.cardExpiry}>Expires 12/28</Text>
              </View>
              <View style={styles.defaultPaymentBadge}>
                <Text style={styles.defaultPaymentText}>Default</Text>
              </View>
            </View>
          </View>

          {/* Preferences & Support */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Preferences &amp; Support</Text>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => showMessage('Notifications', 'Push notification settings and order alert updates.')}
              style={styles.linkRow}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.linkText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => showMessage('Help Center', 'ArtisanThread Concierge: support@artisanthread.lk\nTel: +94 11 234 5678')}
              style={styles.linkRow}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="help-circle-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.linkText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() =>
                showMessage(
                  'Escrow Protection',
                  'Every transaction is held in secure escrow until you receive and approve your artisan craft piece.'
                )
              }
              style={[styles.linkRow, styles.lastRow]}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                <Text style={styles.linkText}>Escrow Protection Guarantee</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.signOutBtn}
          >
            <Ionicons name="log-out-outline" size={18} color="#D32F2F" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEFEF',
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F7F6',
    borderWidth: 1,
    borderColor: '#E2E8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.primaryDark,
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 12,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    shadowColor: '#00251A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E0F2F1',
    borderWidth: 3,
    borderColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#004D40',
    fontSize: 30,
    fontWeight: '800',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: '800',
  },
  email: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  verifiedBuyerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  verifiedText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  statPill: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2F1',
    borderWidth: 1,
    borderColor: '#CDEAE4',
  },
  statText: {
    color: '#004D40',
    fontSize: 12,
    fontWeight: '700',
  },
  wishlistTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  wishlistLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wishlistIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistTitle: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 14,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F3F2',
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 12.5,
  },
  fieldValue: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    padding: 12,
    marginTop: 4,
  },
  addressName: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  addressBody: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  defaultPill: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultPillText: {
    color: '#004D40',
    fontSize: 10.5,
    fontWeight: '700',
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF2F0',
    padding: 12,
    gap: 12,
    marginTop: 4,
  },
  visaBadge: {
    width: 44,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1A1F71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  paymentInfo: {
    flex: 1,
  },
  cardNumber: {
    color: COLORS.textPrimary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  cardExpiry: {
    color: COLORS.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  defaultPaymentBadge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultPaymentText: {
    color: '#004D40',
    fontSize: 10.5,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F3F2',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 4,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default BuyerProfileScreen;
