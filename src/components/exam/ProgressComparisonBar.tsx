import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import * as Animatable from 'react-native-animatable';
import defaultProfile from '@/assets/images/default_profile.png';

type ProgressComparisonBarProps = {
  label: string;
  value?: number;
  userImageUri?: string;
  color?: string;
  peersValue?: number;
  averageValue?: number;
  showAverageValue?: boolean;
  showUserImage?: boolean;
  showAverageImage?: boolean; // New prop to control average image visibility
  averageColor?: string;
  animationDuration?: number;
  animationDelay?: number;
  minimumValue?: number;
  averageImageUri?: string; // New prop for average avatar
};

const ProgressComparisonBar: React.FC<ProgressComparisonBarProps> = ({
  label,
  value = 5,
  userImageUri = '',
  color = '#FF3378',
  peersValue = 5,
  averageValue = 0,
  showAverageValue = false,
  showUserImage = false,
  showAverageImage = false, // New prop with default value
  averageColor = '#F8D448',
  animationDuration = 1500,
  animationDelay = 0,
  minimumValue = 0.6,
  averageImageUri = '', // New prop with default value
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedAverageValue = useRef(new Animated.Value(0)).current;
  const [showLabels, setShowLabels] = useState(false);
  const isMountedRef = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const averageAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Convert value from 0-10 scale to 0-100% scale
  const convertToPercentage = useCallback((originalValue: number) => {
    return (originalValue / 10) * 100;
  }, []);

  // Calculate the width for the colored fill
  const getProgressBarStyles = useCallback(() => {
    // The fill should always show at least the minimum value
    const displayValue = Math.max(value, minimumValue);
    return convertToPercentage(displayValue);
  }, [value, minimumValue, convertToPercentage]);

  const effectiveValue = getProgressBarStyles();
  const effectiveAverageValue = convertToPercentage(Math.max(averageValue, minimumValue));
  const effectivePeersValue = convertToPercentage(Math.max(peersValue, minimumValue));

  const hasAverage = showAverageValue && averageValue !== null && averageValue !== undefined;

  // Determine which bar should be on top based on values
  const isValueLarger = effectiveValue > effectiveAverageValue;

  // Memoized toggle function to prevent unnecessary re-renders
  const toggleLabels = useCallback(() => {
    if (isMountedRef.current) {
      setShowLabels(prev => !prev);
    }
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    // Stop any existing animations
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (averageAnimationRef.current) {
      averageAnimationRef.current.stop();
    }

    animatedValue.setValue(0);
    animatedAverageValue.setValue(0);

    const mainAnimation = Animated.timing(animatedValue, {
      toValue: effectiveValue,
      duration: animationDuration,
      delay: animationDelay,
      useNativeDriver: false,
    });

    const averageAnimation =
      hasAverage && effectiveAverageValue !== null
        ? Animated.timing(animatedAverageValue, {
            toValue: effectiveAverageValue,
            duration: animationDuration,
            delay: animationDelay + 200,
            useNativeDriver: false,
          })
        : null;

    // Store animation references
    animationRef.current = mainAnimation;
    averageAnimationRef.current = averageAnimation;

    // Start animations only if component is still mounted
    if (isMountedRef.current) {
      mainAnimation.start(finished => {
        // Only proceed if animation finished normally and component is still mounted
        if (finished && isMountedRef.current) {
          // Animation completed successfully
        }
      });

      if (averageAnimation) {
        averageAnimation.start(finished => {
          // Only proceed if animation finished normally and component is still mounted
          if (finished && isMountedRef.current) {
            // Animation completed successfully
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      if (averageAnimationRef.current) {
        averageAnimationRef.current.stop();
        averageAnimationRef.current = null;
      }
    };
  }, [effectiveValue, effectiveAverageValue, animationDuration, animationDelay, hasAverage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (averageAnimationRef.current) {
        averageAnimationRef.current.stop();
      }
    };
  }, []);

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const animatedAverageWidth = animatedAverageValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const animatedUserPhotoLeft = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Calculate the position for the average marker
  const animatedAveragePosition = animatedAverageValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Create the bars with proper z-index based on values
  const renderProgressBars = useCallback(() => {
    const valueFill = (
      <Animated.View
        key="value-fill"
        style={[
          styles.progressBarFill,
          {
            width: animatedWidth,
            backgroundColor: color,
            zIndex: isValueLarger ? 1 : 2,
          },
        ]}
      />
    );

    const averageFill = hasAverage ? (
      <Animated.View
        key="average-fill"
        style={[
          styles.progressBarFill,
          {
            width: animatedAverageWidth,
            backgroundColor: averageColor,
            zIndex: isValueLarger ? 2 : 1,
          },
        ]}
      />
    ) : null;

    // Return bars in order - larger value first (behind), smaller value second (front)
    if (isValueLarger) {
      return [valueFill, averageFill];
    } else {
      return [averageFill, valueFill];
    }
  }, [animatedWidth, animatedAverageWidth, color, averageColor, isValueLarger, hasAverage]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <View style={styles.barContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleLabels}
          style={styles.progressBarBackground}
        >
          {renderProgressBars()}

          <View
            style={[
              styles.markerContainer,
              {
                left: `${effectivePeersValue}%`,
                alignItems: 'center',
                justifyContent: 'flex-end',
                zIndex: 100,
              },
            ]}
          >
            <View style={styles.dashedLine} />
            <View style={styles.markerDot} />
          </View>

          {hasAverage && (
            <Animated.View
              style={[
                styles.markerContainer,
                { left: animatedAveragePosition, alignItems: 'center', justifyContent: 'flex-end' },
              ]}
            >
              <View style={styles.dashedLine} />
              <View style={styles.markerDot} />
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* User photo moved outside the progress bar background to avoid clipping */}
        {showUserImage && (
          <Animated.View
            style={[
              styles.userPhotoContainer,
              {
                left: animatedUserPhotoLeft,
              },
            ]}
          >
            <Image
              source={userImageUri ? { uri: userImageUri } : defaultProfile}
              style={styles.userPhoto}
              onError={() => {
                // Handle image loading errors gracefully
                console.warn('Failed to load user image:', userImageUri);
              }}
            />
          </Animated.View>
        )}

        {/* Average photo moved outside the progress bar background to avoid clipping */}
        {showAverageImage && hasAverage && (
          <Animated.View
            style={[
              styles.averagePhotoContainer,
              {
                left: animatedAveragePosition,
              },
            ]}
          >
            <Image
              source={averageImageUri ? { uri: averageImageUri } : defaultProfile}
              style={styles.averagePhoto}
              onError={() => {
                console.warn('Failed to load average image:', averageImageUri);
              }}
            />
          </Animated.View>
        )}

        <Animatable.View
          animation="fadeIn"
          duration={300}
          easing={'ease-out'}
          style={[styles.absoluteLabel, styles.peersLabel, { left: `${effectivePeersValue}%` }]}
        >
          <ThemedText style={[styles.markerText]}>YOUR PEERS</ThemedText>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    marginLeft: 16,
    fontFamily: 'Helvetica',
  },
  barContainer: {
    position: 'relative',
    height: 53,
  },
  progressBarBackground: {
    height: 53,
    borderRadius: 26.5,
    backgroundColor: '#47ADE8',
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    left: 0,
    borderTopLeftRadius: 26.5,
    borderBottomLeftRadius: 26.5,
  },
  averageSection: {
    position: 'absolute',
    height: '100%',
  },
  markerContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  dashedLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'white',
  },
  markerDot: {
    position: 'absolute',
    top: '50%',
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'white',
    marginTop: -4,
  },
  markerText: {
    fontFamily: 'Helvetica',
    position: 'absolute',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    top: '50%',
    marginTop: -8,
    zIndex: 1,
  },
  userPhotoContainer: {
    position: 'absolute',
    top: '50%',
    marginLeft: -16,
    transform: [{ translateY: -16 }],
    zIndex: 20,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  // New styles for average avatar
  averagePhotoContainer: {
    position: 'absolute',
    top: '50%',
    marginLeft: -16,
    transform: [{ translateY: -16 }],
    zIndex: 20,
  },
  averagePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  absoluteLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backgroundColor: 'red',
  },
  peersLabel: {
    backgroundColor: 'red',
    bottom: -10,
  },
  averageLabel: {
    top: -10,
  },
});

export default ProgressComparisonBar;
