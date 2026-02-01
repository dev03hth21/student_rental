import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';
import { colors } from './src/constants';
import Logo from './src/components/Logo';

// Reduce memory overhead and improve navigation performance
enableScreens(true);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      {isReady ? (
        <>
          <AppNavigator />
          <StatusBar style="auto" />
        </>
      ) : (
        <View style={styles.splash}>
          <Logo size={180} />
          <ActivityIndicator style={styles.spinner} color={colors.primary} />
        </View>
      )}
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  spinner: {
    marginTop: 16,
  },
});
