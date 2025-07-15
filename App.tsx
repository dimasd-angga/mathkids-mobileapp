import React, { useEffect, useCallback, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppNavigator from '@/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import './global.css';
import './gesture-handler';
import { AlertNotificationRoot } from 'react-native-alert-notification';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Font.loadAsync({
          CooperBlack: require('./assets/fonts/cooper-black.ttf'),
          Arial: require('./assets/fonts/arial.ttf'),
          'Arial-Black': require('./assets/fonts/ariblk.ttf'),
          Helvetica: require('./assets/fonts/Helvetica.ttf'),
          'Helvetica-Bold': require('./assets/fonts/Helvetica-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AlertNotificationRoot>
        <GestureHandlerRootView className="flex-1">
          <View className="flex-1" onLayout={onLayoutRootView}>
            <AppNavigator />
          </View>
        </GestureHandlerRootView>
      </AlertNotificationRoot>
    </ThemeProvider>
  );
}
