# ArtisanThread Mobile Application

Handmade with Soul, Delivered with Care.

A multi-role React Native & Expo application connecting Art Lovers (Buyers), Traditional Craftsmen (Artisans), and Eco Express Couriers.

---

## 🎨 Color Theme & Design System

- **Primary Color:** Deep Green (`#004D40`)
- **Primary Light:** `#00796B`
- **Primary Dark:** `#00251A`
- **Primary Muted:** `#E0F2F1`
- **Role Accents:**
  - **Buyer:** `#004D40` (Curator Deep Green)
  - **Artisan:** `#A0522D` (Clay & Terracotta)
  - **Courier:** `#0D47A1` (Logistics Sapphire)

---

## 📁 Clean Folder Structure

```text
ArtisanThread/
├── App.js                         # Root App setup (SafeAreaProvider, AuthProvider, RootNavigator)
├── app.json                       # Expo configuration
├── package.json                   # Dependencies & scripts
└── src/
    ├── constants/
    │   ├── colors.js              # Deep green color palette & semantic accents
    │   ├── theme.js               # Spacing, typography, border radii, shadows
    │   └── index.js
    ├── context/
    │   ├── AuthContext.js         # Role-based state management (Buyer, Artisan, Courier)
    │   └── index.js
    ├── components/
    │   ├── Button.js              # Reusable button with variants
    │   ├── Card.js                # Elevated surface cards
    │   ├── RoleBadge.js           # Visual tag for Buyer / Artisan / Courier
    │   ├── RoleSwitcher.js        # Instant role toggler for development & testing
    │   ├── ScreenHeader.js        # Safe-area brand header with user meta & sign-out
    │   └── index.js
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js          # Role selector & credential entry
    │   │   ├── RegisterScreen.js       # Dynamic registration with role fields
    │   │   └── ForgotPasswordScreen.js # Password recovery flow
    │   ├── buyer/
    │   │   ├── BuyerHomeScreen.js      # Curated handcrafted marketplace & search
    │   │   ├── BuyerOrdersScreen.js    # Shipments & real-time delivery status
    │   │   └── BuyerProfileScreen.js   # Addresses & preferences
    │   ├── artisan/
    │   │   ├── ArtisanDashboardScreen.js # Workshop metrics & pickup schedule
    │   │   ├── ArtisanProductsScreen.js  # Handcrafted inventory management
    │   │   ├── ArtisanOrdersScreen.js    # Custom crafting & dispatch tracking
    │   │   └── ArtisanProfileScreen.js   # Master craftsman atelier profile
    │   ├── courier/
    │   │   ├── CourierDeliveriesScreen.js # Pickup & handover assignments
    │   │   ├── CourierRoutesScreen.js     # Route stops & itinerary optimizer
    │   │   ├── CourierEarningsScreen.js   # Daily earnings & tips summary
    │   │   └── CourierProfileScreen.js    # Dispatch availability & fleet specs
    │   └── index.js
    └── navigation/
        ├── routes.js              # Route constants (AUTH, BUYER, ARTISAN, COURIER)
        ├── RootNavigator.js       # Conditional role router & NavigationContainer
        ├── AuthNavigator.js       # Native stack: Login, Register, ForgotPassword
        ├── BuyerNavigator.js      # Bottom tabs: Marketplace, Shipments, Profile
        ├── ArtisanNavigator.js    # Bottom tabs: Dashboard, Crafts, Fulfill, Atelier
        ├── CourierNavigator.js    # Bottom tabs: Deliveries, Routes, Earnings, Profile
        └── index.js
```

---

## 🚀 Running the App

```bash
cd ArtisanThread
npm start
# or
npx expo start
```

Press:
- `a` to open in Android emulator
- `i` to open in iOS simulator
- `w` to open in Web browser
