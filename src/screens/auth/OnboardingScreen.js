import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------
// Vector Illustrations matching A1, A2, and A3 design mockups
// -------------------------------------------------------------

/**
 * Slide A1: Courier Route & Fragile Parcel Illustration
 */
const CourierIllustration = () => (
  <View style={styles.illustrationContainer}>
    {/* Top Card: Route & Pin */}
    <View style={styles.a1RouteCard}>
      {/* Starting Point (Ring with Dot) */}
      <View style={styles.a1StartPoint}>
        <View style={styles.a1StartInnerDot} />
      </View>

      {/* Curved Dotted Route Path */}
      <View style={styles.a1DottedPath}>
        <View style={[styles.a1Dot, { left: 32, bottom: 28 }]} />
        <View style={[styles.a1Dot, { left: 52, bottom: 42 }]} />
        <View style={[styles.a1Dot, { left: 74, bottom: 52 }]} />
        <View style={[styles.a1Dot, { left: 98, bottom: 56 }]} />
        <View style={[styles.a1Dot, { left: 122, bottom: 52 }]} />
        <View style={[styles.a1Dot, { left: 144, bottom: 44 }]} />
        <View style={[styles.a1Dot, { left: 166, bottom: 46 }]} />
        <View style={[styles.a1Dot, { left: 186, bottom: 58 }]} />
        <View style={[styles.a1Dot, { left: 202, bottom: 74 }]} />
      </View>

      {/* Red Map Pinpoint */}
      <View style={styles.a1PinContainer}>
        <View style={styles.a1PinOuter}>
          <View style={styles.a1PinInner} />
        </View>
        <View style={styles.a1PinTail} />
      </View>
    </View>

    {/* Bottom Card: Courier Avatar & Fragile Parcel */}
    <View style={styles.a1CourierCard}>
      {/* Courier Figure */}
      <View style={styles.a1CourierWrapper}>
        <View style={styles.a1CourierHead} />
        <View style={styles.a1CourierBody}>
          <View style={styles.a1CourierCollar} />
        </View>
      </View>

      {/* White Parcel with Packaging Straps & Fragile Mark */}
      <View style={styles.a1Box}>
        {/* Horizontal Tape */}
        <View style={styles.a1TapeHorizontal} />
        {/* Vertical Tape */}
        <View style={styles.a1TapeVertical} />
        {/* Fragile Sticker */}
        <View style={styles.a1FragileSticker}>
          <View style={styles.a1FragileMark} />
        </View>
      </View>
    </View>
  </View>
);

/**
 * Slide A2: Artisan Weaving at Loom / Batik Table Illustration
 */
const ArtisanIllustration = () => (
  <View style={styles.illustrationContainer}>
    {/* Loom Background Board with Vertical Warp Lines */}
    <View style={styles.a2LoomBoard}>
      <View style={styles.a2LoomLine1} />
      <View style={styles.a2LoomLine2} />
      <View style={styles.a2LoomLine3} />
      <View style={styles.a2LoomLine4} />

      {/* Artisan in Traditional Hood / Head Covering */}
      <View style={styles.a2ArtisanHood}>
        <View style={styles.a2ArtisanFace} />
      </View>

      {/* Artisan Body & Arms */}
      <View style={styles.a2ArtisanBody}>
        <View style={styles.a2ArmLeft} />
        <View style={styles.a2ArmRight} />
      </View>

      {/* White Batik Cloth with Handcrafted Dyes */}
      <View style={styles.a2ClothCard}>
        {/* Batik Colored Dots Pattern */}
        <View style={[styles.a2BatikDot, { backgroundColor: '#1A237E', top: 16, left: 24 }]} />
        <View style={[styles.a2BatikDot, { backgroundColor: '#D32F2F', top: 38, left: 42 }]} />
        <View style={[styles.a2BatikDot, { backgroundColor: '#0B5D48', top: 22, left: 66 }]} />
        <View style={[styles.a2BatikDot, { backgroundColor: '#C68A27', top: 48, left: 86 }]} />
        <View style={[styles.a2BatikDot, { backgroundColor: '#D84315', top: 20, left: 110 }]} />
        <View style={[styles.a2BatikDot, { backgroundColor: '#2E7D32', top: 44, left: 128 }]} />
      </View>
    </View>
  </View>
);

/**
 * Slide A3: Buyer Checking Phone with Verified Badge & Parcel
 */
const BuyerIllustration = () => (
  <View style={styles.illustrationContainer}>
    <View style={styles.a3Backdrop}>
      {/* Left White Parcel with Straps */}
      <View style={styles.a3Box}>
        <View style={styles.a3TapeHorizontal} />
        <View style={styles.a3TapeVertical} />
      </View>

      {/* Buyer Figure */}
      <View style={styles.a3BuyerWrapper}>
        <View style={styles.a3BuyerHead} />
        <View style={styles.a3BuyerBody} />

        {/* Hand holding Smartphone */}
        <View style={styles.a3Phone}>
          <View style={styles.a3PhoneScreen} />
        </View>

        {/* Verified Artisan Badge (Green Circle with Checkmark) */}
        <View style={styles.a3VerifiedBadge}>
          <Text style={styles.a3Checkmark}>✓</Text>
        </View>
      </View>
    </View>
  </View>
);

// -------------------------------------------------------------
// Slides Data
// -------------------------------------------------------------
const ONBOARDING_SLIDES = [
  {
    id: 'A1',
    bgColor: '#122421', // Dark Theme
    title: 'Deliver with\nconfidence',
    subtitle:
      'Verified addresses, structured pickup details and fragile-item handling — no more guessing rural addresses.',
    buttonLabel: 'Get Started',
    buttonBg: '#0B5D48',
    buttonTextColor: '#FFFFFF',
    illustration: <CourierIllustration />,
  },
  {
    id: 'A2',
    bgColor: '#0B5D48', // Green Theme
    title: 'Sell your craft,\nyour way',
    subtitle:
      'List handmade batik, weaves and crafts in minutes — track orders and stock without a single notebook.',
    buttonLabel: 'Next',
    buttonBg: '#FFFFFF',
    buttonTextColor: '#0B5D48',
    illustration: <ArtisanIllustration />,
  },
  {
    id: 'A3',
    bgColor: '#C68A27', // Brown/Gold Theme
    title: 'Shop with\nconfidence',
    subtitle:
      'Verified artisan badges, real reviews, and secure payment held until your order is inspected and confirmed.',
    buttonLabel: 'Next',
    buttonBg: '#FFFFFF',
    buttonTextColor: '#C68A27',
    illustration: <BuyerIllustration />,
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  const handleSkip = () => {
    // Navigates directly to Login / Welcome Back screen
    if (navigation?.navigate) {
      navigation.navigate('WelcomeBack');
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Last slide: Proceed to Login / Welcome Back screen
      handleSkip();
    }
  };

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const currentSlide = ONBOARDING_SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentSlide.bgColor} />

      {/* Top Right "Skip" Button */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            style={[styles.skipButton, { top: Math.max(insets.top, 12) }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Swipeable FlatList */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            {/* Visual Graphic Area */}
            <View style={styles.graphicSection}>{item.illustration}</View>

            {/* Pagination Dots */}
            <View style={styles.paginationRow}>
              {ONBOARDING_SLIDES.map((_, dotIndex) => {
                const isActive = dotIndex === currentIndex;
                return (
                  <View
                    key={dotIndex}
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                );
              })}
            </View>

            {/* Typography Content */}
            <View style={styles.textSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            {/* Full-width Rounded Action Button */}
            <View style={[styles.buttonSection, { paddingBottom: Math.max(insets.bottom, 24) }]}>
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.88}
                style={[styles.actionButton, { backgroundColor: item.buttonBg }]}
              >
                <Text style={[styles.actionButtonText, { color: item.buttonTextColor }]}>
                  {item.buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  skipButton: {
    position: 'absolute',
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  slide: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
  },
  graphicSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    width: 270,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ----------------------------------------------------
  // Slide A1 Vector Styles (Courier, Route, Fragile Box)
  // ----------------------------------------------------
  a1RouteCard: {
    width: 260,
    height: 110,
    backgroundColor: '#1C352F',
    borderRadius: 20,
    position: 'relative',
    marginBottom: 14,
    overflow: 'hidden',
  },
  a1StartPoint: {
    position: 'absolute',
    left: 20,
    bottom: 22,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4DB6AC',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  a1StartInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4DB6AC',
  },
  a1DottedPath: {
    ...StyleSheet.absoluteFillObject,
  },
  a1Dot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E0A953',
  },
  a1PinContainer: {
    position: 'absolute',
    top: 14,
    right: 24,
    alignItems: 'center',
  },
  a1PinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  a1PinInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  a1PinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#E53935',
    marginTop: -2,
  },
  a1CourierCard: {
    width: 260,
    height: 115,
    backgroundColor: '#1C352F',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  a1CourierWrapper: {
    alignItems: 'center',
  },
  a1CourierHead: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5BA7D',
    marginBottom: -4,
    zIndex: 2,
  },
  a1CourierBody: {
    width: 56,
    height: 48,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#0B5D48',
    alignItems: 'center',
    overflow: 'hidden',
  },
  a1CourierCollar: {
    width: 28,
    height: 12,
    backgroundColor: '#C68A27',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  a1Box: {
    width: 66,
    height: 66,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  a1TapeHorizontal: {
    position: 'absolute',
    top: 27,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#F3E5D8',
  },
  a1TapeVertical: {
    position: 'absolute',
    left: 27,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#F3E5D8',
  },
  a1FragileSticker: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 16,
    height: 20,
    backgroundColor: '#FFCDD2',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  a1FragileMark: {
    width: 3,
    height: 10,
    backgroundColor: '#D32F2F',
    borderRadius: 1.5,
  },

  // ----------------------------------------------------
  // Slide A2 Vector Styles (Artisan, Loom, Batik Table)
  // ----------------------------------------------------
  a2LoomBoard: {
    width: 260,
    height: 230,
    backgroundColor: '#073E30',
    borderRadius: 22,
    alignItems: 'center',
    paddingTop: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  a2LoomLine1: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  a2LoomLine2: {
    position: 'absolute',
    left: 48,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  a2LoomLine3: {
    position: 'absolute',
    right: 48,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  a2LoomLine4: {
    position: 'absolute',
    right: 24,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  a2ArtisanHood: {
    width: 76,
    height: 80,
    backgroundColor: '#C68A27',
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  a2ArtisanFace: {
    width: 48,
    height: 52,
    borderRadius: 24,
    backgroundColor: '#E5BA7D',
  },
  a2ArtisanBody: {
    width: 84,
    height: 44,
    backgroundColor: '#C68A27',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
    position: 'relative',
  },
  a2ArmLeft: {
    position: 'absolute',
    left: -8,
    top: 6,
    width: 14,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#C68A27',
  },
  a2ArmRight: {
    position: 'absolute',
    right: -8,
    top: 6,
    width: 14,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#C68A27',
  },
  a2ClothCard: {
    width: 170,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: -10,
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    position: 'relative',
  },
  a2BatikDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // ----------------------------------------------------
  // Slide A3 Vector Styles (Buyer, Smartphone, Badge)
  // ----------------------------------------------------
  a3Backdrop: {
    width: 260,
    height: 220,
    backgroundColor: '#A86E14',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 16,
    position: 'relative',
  },
  a3Box: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  a3TapeHorizontal: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#C68A27',
  },
  a3TapeVertical: {
    position: 'absolute',
    left: 25,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#C68A27',
  },
  a3BuyerWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  a3BuyerHead: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5BA7D',
    marginBottom: -4,
    zIndex: 2,
  },
  a3BuyerBody: {
    width: 82,
    height: 68,
    backgroundColor: '#0B5D48',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  a3Phone: {
    position: 'absolute',
    top: 36,
    right: -8,
    width: 38,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 5,
  },
  a3PhoneScreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
  },
  a3VerifiedBadge: {
    position: 'absolute',
    top: 44,
    right: -24,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  a3Checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  // ----------------------------------------------------
  // Bottom Pagination & Typography
  // ----------------------------------------------------
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 26,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  actionButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
