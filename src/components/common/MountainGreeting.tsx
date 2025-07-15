import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import EverestSVG from '@/assets/images/mountain-everest.svg';
import JayaWijayaSVG from '@/assets/images/mountain-wijaya.svg';
import AconSVG from '@/assets/images/mountain-acon.svg';
import DenaliSVG from '@/assets/images/mountain-denali.svg';
import EverestFaceSVG from '@/assets/images/mountain-everest-face.svg';
import JayaWijayaFaceSVG from '@/assets/images/mountain-jaya-wijaya-face.svg';
import AconFaceSVG from '@/assets/images/mountain-acon-face.svg';
import DenaliFaceSVG from '@/assets/images/mountain-denali-face.svg';

import MountainEverestWide from '@/assets/images/mountain-everest-wide.svg';
import MountainJayaWijayaWide from '@/assets/images/mountain-wijaya-wide.svg';
import MountainAconWide from '@/assets/images/mountain-acon-wide.svg';
import MountainDenaliWide from '@/assets/images/mountain-denali-wide.svg';
import MountainEverestWideFace from '@/assets/images/mountain-everest-wide-face.svg';
import MountainJayaWijayaWideFace from '@/assets/images/mountain-wijaya-wide-face.svg';
import MountainAconWideFace from '@/assets/images/mountain-acon-wide-face.svg';
import MountainDenaliWideFace from '@/assets/images/mountain-denali-wide-face.svg';

import MountainWijayaBubble from '@/assets/images/mountain-wijaya-bubble.svg';
import MountainDenaliBubble from '@/assets/images/mountain-denali-bubble.svg';
import MountainAconBubble from '@/assets/images/mountain-acon-bubble.svg';
import MountainEverestBubble from '@/assets/images/mountain-everest-bubble.svg';

import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import GreetingText from './GreetingText';
import { useAuth } from '@/hooks/useAuth';
import Svg, { Rect } from 'react-native-svg';
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const mountainConfigs = {
  '1': {
    startWidth: 800,
    endWidth: 200,
    startTop: 198,
    endTop: 30,
    marginTop: 40,
    marginTopText: 40,
    flagWidthMultiplier: 0.5,
    minFlagWidth: 120,
    maxFlagWidth: 800,
  },
  '2': {
    startWidth: 900,
    endWidth: 120,
    startTop: 208,
    endTop: 20,
    marginTop: 35,
    marginTopText: 70,
    flagWidthMultiplier: 0.5,
    minFlagWidth: 120,
    maxFlagWidth: 900,
  },
  '3': {
    startWidth: 1000,
    endWidth: 200,
    startTop: 250,
    endTop: 20,
    marginTop: -10,
    marginTopText: 70,
    flagWidthMultiplier: 0.44,
    minFlagWidth: 130,
    maxFlagWidth: 1000,
  },
  '4': {
    startWidth: 900,
    endWidth: 200,
    startTop: 208,
    endTop: 20,
    marginTop: 35,
    marginTopText: 70,
    flagWidthMultiplier: 0.5,
    minFlagWidth: 120,
    maxFlagWidth: 900,
  },
};

export default function MountainGreeting({ globalFlagMultiplier = 1.0, customFlagWidth = null }) {
  const { user } = useAuth();
  const currentLevel = user?.grade?.lastExam || 1;
  const totalLevel = user?.grade?.totalExam || 1;

  // const currentLevel = 1;
  // const totalLevel = 5;

  const gradeIndex = user?.grade?.index?.toString() || '1';
  // const gradeIndex = '2';
  const [mountainLayout, setMountainLayout] = useState({ height: 361, width: 552, x: 0, y: 20 });
  const [hiRealLayout, setHiRealLayout] = useState({
    height: 78.66665649414062,
    width: 246.66668701171875,
    x: 152.6666717529297,
    y: 132.3333282470703,
  });

  const animatedLevel = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedLevel, {
      toValue: currentLevel,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [currentLevel]);

  const calculateFlagWidth = (current: number, total: number, mountainIndex: string) => {
    const config = mountainConfigs[mountainIndex as keyof typeof mountainConfigs];
    const defaultSVGWidth = 552;

    if (!config) return customFlagWidth || 100;
    if (!mountainLayout.width) return customFlagWidth || 0;

    if (customFlagWidth) {
      return Math.max(
        config.minFlagWidth || 50,
        Math.min(customFlagWidth, config.maxFlagWidth || 400),
      );
    }

    const startRatio = config.startWidth / defaultSVGWidth;
    const endRatio = config.endWidth / defaultSVGWidth;

    let baseWidth;
    if (total === 1 && current === 1) {
      baseWidth = Math.round(endRatio * mountainLayout.width);
    } else if (total <= 1) {
      baseWidth = Math.round(startRatio * mountainLayout.width);
    } else if (current === 1) {
      baseWidth = Math.round(startRatio * mountainLayout.width);
    } else if (current === total) {
      baseWidth = Math.round(endRatio * mountainLayout.width);
    } else {
      const progress = (current - 1) / (total - 1);
      const ratio = startRatio - progress * (startRatio - endRatio);
      baseWidth = Math.round(ratio * mountainLayout.width);
    }

    const configMultiplier = config.flagWidthMultiplier || 1.0;
    const finalWidth = Math.round(baseWidth * configMultiplier * globalFlagMultiplier);

    const minWidth = config.minFlagWidth || 50;
    const maxWidth = config.maxFlagWidth || 400;

    return Math.max(minWidth, Math.min(finalWidth, maxWidth));
  };

  const getAdaptiveFlagWidth = (current: number, total: number, mountainIndex: string) => {
    const screenWidth = Dimensions.get('window').width;
    const isTablet = Platform.OS === 'ios' ? Platform.isPad : screenWidth >= 768;

    let baseWidth = calculateFlagWidth(current, total, mountainIndex);

    if (screenWidth < 375) {
      baseWidth *= 0.8;
    } else if (screenWidth > 768 && !isTablet) {
      baseWidth *= 0.9;
    } else if (isTablet) {
      baseWidth *= 1.1;
    }

    return Math.round(baseWidth);
  };

  const animatedFlagWidth = animatedLevel.interpolate({
    inputRange: [0, totalLevel],
    outputRange: [
      getAdaptiveFlagWidth(1, totalLevel, gradeIndex),
      getAdaptiveFlagWidth(currentLevel, totalLevel, gradeIndex),
    ],
    extrapolate: 'clamp',
  });

  const config = mountainConfigs[gradeIndex as keyof typeof mountainConfigs];
  const minTop = mountainLayout.y + (config?.endTop ?? 0); // where the flag ends (top)
  const maxTop = mountainLayout.y + (config?.startTop ?? 0); // where the flag starts (bottom)
  const outputrange = totalLevel === 1 ? [minTop, minTop] : [maxTop, minTop];
  const animatedFlagTop = animatedLevel.interpolate({
    inputRange: [1, totalLevel],
    outputRange: outputrange,
    extrapolate: 'clamp',
  });

  const flagCenter = hiRealLayout.x + hiRealLayout.width / 2;
  const flagPosition = {
    position: 'absolute' as const,
    left: Animated.subtract(flagCenter, Animated.divide(animatedFlagWidth, 2)),
    top: animatedFlagTop,
    zIndex: 5,
  };

  const getMountainMarginTop = (index: string) => {
    const config = mountainConfigs[index as keyof typeof mountainConfigs];
    return config?.marginTop || 15;
  };

  const getMountainTextMarginTop = (index: string) => {
    const config = mountainConfigs[index as keyof typeof mountainConfigs];
    return config?.marginTopText || 15;
  };

  const renderMountain = (index: string) => {
    const isTablet = Platform.OS === 'ios' ? Platform.isPad : Dimensions.get('window').width >= 768;
    switch (index) {
      case '1':
        return isTablet ? <MountainJayaWijayaWide /> : <JayaWijayaSVG />;
      case '2':
        return isTablet ? <MountainDenaliWide /> : <DenaliSVG />;
      case '3':
        return isTablet ? <MountainAconWide /> : <AconSVG />;
      case '4':
        return isTablet ? <MountainEverestWide /> : <EverestSVG />;
      default:
        return isTablet ? <MountainJayaWijayaWide /> : <JayaWijayaSVG />;
    }
  };

  const renderMountainFace = (index: string) => {
    const isTablet = Platform.OS === 'ios' ? Platform.isPad : Dimensions.get('window').width >= 768;

    switch (index) {
      case '1':
        return isTablet ? (
          <MountainJayaWijayaWideFace style={styles.faceStyle} />
        ) : (
          <JayaWijayaFaceSVG style={styles.faceStyle} />
        );
      case '2':
        return isTablet ? (
          <MountainDenaliWideFace style={styles.faceStyle} />
        ) : (
          <DenaliFaceSVG style={styles.faceStyle} />
        );
      case '3':
        return isTablet ? (
          <MountainAconWideFace style={styles.faceStyle} />
        ) : (
          <AconFaceSVG style={styles.faceStyle} />
        );
      case '4':
        return isTablet ? (
          <MountainEverestWideFace style={styles.faceStyle} />
        ) : (
          <EverestFaceSVG style={styles.faceStyle} />
        );
      default:
        return isTablet ? (
          <MountainJayaWijayaWideFace style={styles.faceStyle} />
        ) : (
          <JayaWijayaFaceSVG style={styles.faceStyle} />
        );
    }
  };

  const renderMountainBubble = (index: string) => {
    switch (index) {
      case '1':
        return <MountainWijayaBubble />;
      case '2':
        return <MountainDenaliBubble />;
      case '3':
        return <MountainAconBubble />;
      case '4':
        return <MountainEverestBubble />;
      default:
        return <MountainWijayaBubble />;
    }
  };

  const mountainMarginTop = getMountainMarginTop(gradeIndex);
  const mountainMarginTopText = getMountainTextMarginTop(gradeIndex);

  const zoomOutTilt = {
    0: {
      opacity: 1,
      transform: [{ scale: 1 }, { translateY: 0 }, { rotate: '2deg' }],
    },
    0.5: {
      opacity: 1,
      transform: [{ scale: 0.95 }, { translateY: 5 }, { rotate: '-2deg' }],
    },
  };

  return (
    <View style={styles.container}>
      {/*<LottieView*/}
      {/*  source={require('../../../assets/lottie/Eyes.json')}*/}
      {/*  autoPlay*/}
      {/*  loop*/}
      {/*  style={{ width: 200, height: 200 }}*/}
      {/*/>*/}
      <View
        onLayout={e => {
          setMountainLayout(e.nativeEvent.layout);
        }}
        style={[styles.mountainContainer, { marginTop: mountainMarginTop, position: 'relative' }]}
      >
        {renderMountain(gradeIndex)}
        {renderMountainFace(gradeIndex)}
      </View>

      {/*<Animated.View style={flagPosition}>*/}
      {/*  <AnimatedSvg*/}
      {/*    width={animatedFlagWidth}*/}
      {/*    height={8}*/}
      {/*    viewBox={`0 0 ${animatedFlagWidth} 8`}*/}
      {/*    fill="none"*/}
      {/*  >*/}
      {/*    <AnimatedRect width={animatedFlagWidth as any} height={3} fill="#FF7561" />*/}
      {/*    <AnimatedRect y={3} width={animatedFlagWidth as any} height={2} fill="white" />*/}
      {/*    <AnimatedRect y={5} width={animatedFlagWidth as any} height={3} fill="#FF3278" />*/}
      {/*  </AnimatedSvg>*/}
      {/*</Animated.View>*/}

      <Animatable.View
        animation={zoomOutTilt}
        iterationCount="infinite"
        direction="alternate"
        easing="ease-out"
        style={[styles.bubbleContainer, { position: 'absolute', right: '25%', top: '-5%' }]}
      >
        {renderMountainBubble(gradeIndex)}
      </Animatable.View>

      <View style={[styles.greetingContainer, { marginTop: mountainMarginTopText }]}>
        <View
          onLayout={e => {
            console.log('hiRealLayout', e.nativeEvent.layout);
            setHiRealLayout(e.nativeEvent.layout);
          }}
        >
          <GreetingText />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mountainContainer: {
    marginBottom: 32,
  },
  greetingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  faceStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bubbleContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
