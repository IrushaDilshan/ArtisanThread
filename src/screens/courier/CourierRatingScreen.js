import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

export const CourierRatingScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

  // Default to 4 stars matching screenshot
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  const artisanName = route?.params?.artisanName || 'Malsha Maduwanthi';

  const handleSubmit = () => {
    Alert.alert(
      'Thank You! 🙏',
      `Your ${rating}-star feedback for ${artisanName} has been submitted successfully.`,
      [
        {
          text: 'Done',
          onPress: () => {
            if (navigation?.navigate) {
              navigation.navigate(ROUTES.COURIER.HOME);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Section with Back Arrow and Centered Title */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Content Area */}
          <View style={styles.centerSection}>
            {/* 2. Center User/Artisan Badge */}
            <View style={styles.avatarContainer}>
              {/* Silhouette Head */}
              <View style={styles.avatarHead} />
              {/* Silhouette Torso/Shoulders */}
              <View style={styles.avatarTorso} />
            </View>

            {/* 3. Rating Text Content */}
            <Text style={styles.questionTitle}>
              How was your experience{'\n'}at the Artisan's pickup{'\n'}location?
            </Text>

            <Text style={styles.subtitleText}>
              Your feedback will help improve{'\n'}service experience
            </Text>

            {/* 4. Interactive Star Rating Component */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((starIndex) => {
                const isFilled = starIndex <= rating;
                return (
                  <TouchableOpacity
                    key={starIndex}
                    activeOpacity={0.7}
                    onPress={() => setRating(starIndex)}
                    style={styles.starTouch}
                  >
                    <Text
                      style={[
                        styles.starIcon,
                        isFilled ? styles.starFilled : styles.starEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 5. Additional Feedback Box */}
            <View style={styles.feedbackInputCard}>
              <TextInput
                style={styles.feedbackInput}
                multiline
                numberOfLines={4}
                placeholder="Additional comments"
                placeholderTextColor="#94A3B8"
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* 6. Primary Action Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.88}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
  },

  // ----------------------------------------------------
  // 1. Header Section
  // ----------------------------------------------------
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 26,
    color: '#111E1C',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111E1C',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 40,
  },

  // ----------------------------------------------------
  // Main Content Section
  // ----------------------------------------------------
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
  },

  // ----------------------------------------------------
  // 2. Center User/Artisan Badge
  // ----------------------------------------------------
  avatarContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  avatarTorso: {
    width: 54,
    height: 24,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: '#FFFFFF',
  },

  // ----------------------------------------------------
  // 3. Rating Text Content
  // ----------------------------------------------------
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111E1C',
    textAlign: 'center',
    lineHeight: 25,
    maxWidth: 290,
  },
  subtitleText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 260,
  },

  // ----------------------------------------------------
  // 4. Interactive Star Rating Component
  // ----------------------------------------------------
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 24,
  },
  starTouch: {
    padding: 4,
  },
  starIcon: {
    fontSize: 38,
    lineHeight: 40,
  },
  starFilled: {
    color: '#F59E0B', // Amber / Gold
  },
  starEmpty: {
    color: '#E2E8F0', // Light slate gray
  },

  // ----------------------------------------------------
  // 5. Additional Feedback Box
  // ----------------------------------------------------
  feedbackInputCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 108,
  },
  feedbackInput: {
    fontSize: 13,
    color: '#111E1C',
    lineHeight: 19,
    padding: 0,
    margin: 0,
  },

  // ----------------------------------------------------
  // 6. Primary Action Button
  // ----------------------------------------------------
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#004D40',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default CourierRatingScreen;
