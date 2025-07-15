import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemedText } from '@/contexts/ThemeProvider';

type RotatingBadgeProps = {
  children: ReactNode;
  color?: string;
};

export default function RotatingBadge({ children, color = "#F2C900" }: RotatingBadgeProps) {
  // Create a rotation animation value
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Set up the rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds for one full rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  // Create the rotation interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={196} height={196} viewBox="0 0 196 196" fill="none">
          <Path
            d="M194.517 80.9815L186.003 91.2747L196 100.134L185.644 108.57L193.707 119.219L181.894 125.455L187.714 137.479L174.911 141.289L178.282 154.214L164.983 155.467L165.78 168.801L152.493 167.445L150.673 180.677L137.907 176.744L133.523 189.36L121.778 182.998L115.019 194.517L104.725 186.005L95.8655 196L87.4304 185.644L76.7805 193.707L70.5445 181.894L58.5213 187.714L54.7109 174.912L41.7857 178.282L40.5328 164.983L27.1986 165.78L28.555 152.493L15.3228 150.673L19.2562 137.909L6.63962 133.525L13.002 121.78L1.48311 115.018L9.99535 104.727L0 95.8655L10.356 87.4304L2.29317 76.7818L14.1063 70.5445L8.28612 58.5213L21.0884 54.7108L17.7182 41.7857L31.0169 40.5324L30.2197 27.1986L43.5068 28.555L45.327 15.3228L58.0913 19.2575L62.4754 6.63931L74.2205 13.0033L80.9818 1.48309L91.2735 9.99661L100.134 0L108.57 10.3557L119.22 2.29317L125.455 14.1063L137.479 8.28581L141.289 21.0893L154.214 17.7179L155.468 31.0169L168.801 30.2197L167.445 43.5068L180.677 45.327L176.743 58.0926L189.361 62.4767L182.997 74.2217L194.517 80.9815Z"
            fill={color}
          />
        </Svg>
      </Animated.View>

      <View style={styles.textWrapper}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
});
