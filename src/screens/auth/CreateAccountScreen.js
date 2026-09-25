import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

// Vector Icon for Input Prefix Boxes
const PrefixIcon = ({ type }) => {
  switch (type) {
    case 'name':
      return (
        <View style={styles.iconWrapper}>
          <View style={styles.userHead} />
          <View style={styles.userShoulders} />
        </View>
      );
    case 'phone':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.unicodeIcon}>📞</Text>
        </View>
      );
    case 'email':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.unicodeIcon}>✉️</Text>
        </View>
      );
    case 'password':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.unicodeIcon}>🔒</Text>
        </View>
      );
    case 'role':
      return (
        <View style={styles.iconWrapper}>
          <Text style={styles.unicodeIcon}>👥</Text>
        </View>
      );
    default:
      return null;
  }
};

export const CreateAccountScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(route?.params?.phone || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Upload States for ID Card
  const [uploads, setUploads] = useState({
    selfie: false,
    front: false,
    back: false,
  });

  const toggleUpload = (key) => {
    setUploads((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChooseRole = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name or studio name to continue.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone Required', 'Please enter your mobile phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Please enter a password with at least 6 characters.');
      return;
    }

    navigation?.navigate(ROUTES.AUTH.CHOOSE_ROLE, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.screenTitle}>Create your Account</Text>

        {/* Input Fields */}
        <View style={styles.fieldsContainer}>
          {/* Name Field */}
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <PrefixIcon type="name" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor="#9EA8A6"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone Field */}
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <PrefixIcon type="phone" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Phone"
              placeholderTextColor="#9EA8A6"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <PrefixIcon type="email" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="#9EA8A6"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <PrefixIcon type="password" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#9EA8A6"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* ID Card Verification Upload Section */}
        <View style={styles.idCardSection}>
          <Text style={styles.idCardTitle}>ID Card</Text>

          <View style={styles.uploadCardsRow}>
            {/* a) Picture selfie */}
            <TouchableOpacity
              onPress={() => toggleUpload('selfie')}
              activeOpacity={0.8}
              style={[
                styles.uploadBox,
                uploads.selfie && styles.uploadBoxDone,
              ]}
            >
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadEmoji}>🙂</Text>
              </View>
              <Text style={styles.uploadLabel}>
                {uploads.selfie ? '✓ Done' : 'Picture selfie'}
              </Text>
            </TouchableOpacity>

            {/* b) Front */}
            <TouchableOpacity
              onPress={() => toggleUpload('front')}
              activeOpacity={0.8}
              style={[
                styles.uploadBox,
                uploads.front && styles.uploadBoxDone,
              ]}
            >
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadEmoji}>📷</Text>
              </View>
              <Text style={styles.uploadLabel}>
                {uploads.front ? '✓ Done' : 'Front'}
              </Text>
            </TouchableOpacity>

            {/* c) Back */}
            <TouchableOpacity
              onPress={() => toggleUpload('back')}
              activeOpacity={0.8}
              style={[
                styles.uploadBox,
                uploads.back && styles.uploadBoxDone,
              ]}
            >
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadEmoji}>📷</Text>
              </View>
              <Text style={styles.uploadLabel}>
                {uploads.back ? '✓ Done' : 'Back'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Actions Bar */}
        <View style={styles.bottomBar}>
          {/* Round Back Button */}
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
            style={styles.roundBackBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          {/* Bottom-Right "Choose Role" Button */}
          <TouchableOpacity
            onPress={handleChooseRole}
            activeOpacity={0.88}
            style={styles.chooseRoleBtn}
          >
            <Text style={styles.sendIcon}>➤</Text>
            <Text style={styles.chooseRoleText}>Choose Role</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111E1C',
    letterSpacing: -0.3,
    marginBottom: 24,
    marginTop: 12,
  },
  fieldsContainer: {
    gap: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#004D40',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unicodeIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  userHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  userShoulders: {
    width: 20,
    height: 9,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#DDE3E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111E1C',
    backgroundColor: '#FAFCFB',
  },
  idCardSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  idCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111E1C',
    marginBottom: 12,
  },
  uploadCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBox: {
    flex: 1,
    height: 84,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#4DB6AC',
    backgroundColor: '#F5FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  uploadBoxDone: {
    borderColor: '#004D40',
    backgroundColor: '#E0F2F1',
  },
  uploadIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  uploadEmoji: {
    fontSize: 13,
  },
  uploadLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111E1C',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 'auto',
  },
  roundBackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
    marginRight: 2,
  },
  chooseRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004D40',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 22,
    gap: 8,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  chooseRoleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default CreateAccountScreen;
