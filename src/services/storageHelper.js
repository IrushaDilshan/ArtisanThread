import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map();

export const safeStorage = {
  async getItem(key) {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        if (val !== null && val !== undefined) {
          return val;
        }
      }
    } catch (e) {
      // Fallback to memory
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },

  async setItem(key, value) {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    memoryStorage.set(key, stringVal);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, stringVal);
      }
    } catch (e) {
      // Fallback to memory
    }
  },

  async removeItem(key) {
    memoryStorage.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Fallback to memory
    }
  },
};
