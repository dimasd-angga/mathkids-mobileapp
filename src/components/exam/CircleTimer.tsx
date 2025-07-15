import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated as RNAnimated, Text, View, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

interface CircleTimerProps {
  size?: number;
  strokeColor?: string;
  backgroundColor?: string;
  duration?: number;
  startTime?: number;
}

const CircleTimer: React.FC<CircleTimerProps> = ({
  size = 48,
  strokeColor = '#FF3278',
  backgroundColor = '#000000',
  startTime = 0,
}) => {
  const [seconds, setSeconds] = useState(0);
  const animatedValue = useRef(new RNAnimated.Value(0)).current;
  const animationRef = useRef<RNAnimated.CompositeAnimation | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const radius = (size - 8) / 2;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    animatedValue.setValue(0);
  }, [animatedValue]);

  const initializeTimer = useCallback(
    (initialStartTime: number) => {
      cleanup();

      if (!isMountedRef.current) return;

      let initialSeconds = 0;
      if (initialStartTime > 0) {
        const elapsed = Date.now() - initialStartTime;
        initialSeconds = Math.max(0, Math.floor(elapsed / 1000));
      }

      setSeconds(initialSeconds);

      animationRef.current = RNAnimated.loop(
        RNAnimated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      );
      animationRef.current.start();

      intervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;

        if (initialStartTime > 0) {
          const elapsed = Date.now() - initialStartTime;
          const currentSeconds = Math.max(0, Math.floor(elapsed / 1000));
          setSeconds(currentSeconds);
        } else {
          setSeconds(prev => prev + 1);
        }
      }, 1000);
    },
    [animatedValue, cleanup],
  );

  useEffect(() => {
    isMountedRef.current = true;
    initializeTimer(startTime);

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (startTime > 0) {
      initializeTimer(startTime);
    }
  }, [startTime, initializeTimer]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text
        style={{
          position: 'absolute',
          color: strokeColor,
          fontWeight: 'bold',
          fontSize: 15,
        }}
      >
        {seconds}
      </Text>
    </View>
  );
};

export default CircleTimer;
