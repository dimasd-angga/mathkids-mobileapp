import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MountainEverest from '@/assets/images/mountain-everest.svg';
import SunLogo from '@/components/common/SunLogo';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomSplashScreen: React.FC = () => {
  // Calculate scale factor to fit design proportionally
  const designWidth = 390;
  const designHeight = 844;
  const scaleX = screenWidth / designWidth;
  const scaleY = screenHeight / designHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFBE', '#FFF3A3', '#FFE077']}
        locations={[0, 0.39, 0.96]}
        style={styles.gradient}
      />

      <View style={[styles.mountainContainer, { transform: [{ scale }] }]}>
        <MountainEverest />
      </View>

      <View style={[styles.logoContainer, { transform: [{ scale }] }]}>
        <SunLogo />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  mountainContainer: {
    position: 'absolute',
    bottom: '-10%',
    left: '-22%',
    right: 0,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
  },
  characterContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: 50,
    alignItems: 'center',
  },
  flagContainer: {
    width: 147,
    marginTop: 5,
  },
  stripe: {
    width: '100%',
  },
  sunglassesContainer: {
    position: 'absolute',
    top: 30,
    left: -10,
  },
  shineContainer: {
    position: 'absolute',
    top: 25,
    right: -25,
  },
  smileContainer: {
    position: 'absolute',
    bottom: -20,
    left: 15,
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
  },
});

export default CustomSplashScreen;
