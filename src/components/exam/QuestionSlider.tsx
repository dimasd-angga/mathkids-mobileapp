import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ThemedText } from '@/contexts/ThemeProvider';

interface QuestionSliderProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  answeredQuestions: Record<number, boolean | undefined>;
  skippedQuestions?: Record<number, boolean>; // Add skipped questions prop
  height?: number;
  width?: number;
  backgroundColor?: string;
  progressColor?: string;
  buttonColor?: string;
}

const QuestionSlider: React.FC<QuestionSliderProps> = ({
  totalQuestions,
  currentQuestionIndex,
  onQuestionChange,
  answeredQuestions = {},
  skippedQuestions = {}, // Default to empty object
  height = 28,
  width,
  backgroundColor = '#FFFFFF',
  progressColor = '#0082FC',
  buttonColor = '#FFFFFF',
}) => {
  const screenWidth = Dimensions.get('window').width;
  const fullWidth = width || screenWidth;
  const buttonWidth = 70; // Button circle width

  const [componentWidth, setComponentWidth] = useState(fullWidth);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate question width and positioning
  const questionWidth = componentWidth / totalQuestions;
  const buttonOffset = 8; // Offset from the start of each question (adjust as needed)
  const maxButtonPosition = componentWidth - buttonWidth;

  // Calculate safe position that prevents button from being cut off
  const getSafeButtonPosition = (questionIndex: number) => {
    const idealPosition = questionIndex * questionWidth - buttonOffset;
    // Ensure the button doesn't go beyond the right edge
    return Math.min(idealPosition, maxButtonPosition);
  };

  const buttonPosition = useSharedValue(getSafeButtonPosition(currentQuestionIndex));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      if (!width) {
        setComponentWidth(window.width);
      }
    });

    return () => subscription.remove();
  }, [width]);

  useEffect(() => {
    if (!isDragging) {
      // Position button safely without exceeding screen boundaries
      buttonPosition.value = withSpring(getSafeButtonPosition(currentQuestionIndex), {
        damping: 20,
        stiffness: 150,
      });
    }
  }, [
    currentQuestionIndex,
    questionWidth,
    buttonPosition,
    isDragging,
    buttonOffset,
    maxButtonPosition,
  ]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = buttonPosition.value;
      runOnJS(setIsDragging)(true);
    },
    onActive: (event, ctx) => {
      let newPosition = ctx.startX + event.translationX;
      newPosition = Math.max(
        -buttonOffset,
        Math.min(newPosition, maxButtonPosition - buttonOffset),
      );
      buttonPosition.value = newPosition;
    },
    onEnd: () => {
      // Determine which question the button is over (accounting for offset)
      const questionIndex = Math.floor(
        (buttonPosition.value + buttonOffset + buttonWidth / 2) / questionWidth,
      );
      const clampedIndex = Math.max(0, Math.min(questionIndex, totalQuestions - 1));

      // Position button slightly left from the start of the selected question
      buttonPosition.value = withSpring(clampedIndex * questionWidth - buttonOffset, {
        damping: 20,
        stiffness: 150,
      });
      runOnJS(onQuestionChange)(clampedIndex);
      runOnJS(setIsDragging)(false);
    },
  });

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: buttonPosition.value }],
  }));

  const renderSquares = () => {
    const squares = [];

    for (let i = 0; i < totalQuestions; i++) {
      let squareColor = backgroundColor;

      if (skippedQuestions[i]) {
        squareColor = backgroundColor;
      } else if (answeredQuestions[i] === true) {
        squareColor =
          i <= currentQuestionIndex ? 'rgba(140, 255, 106, 1)' : 'rgba(140, 255, 106, 0.4)';
      } else if (answeredQuestions[i] === false) {
        squareColor = i <= currentQuestionIndex ? 'rgba(243, 36, 79, 1)' : 'rgba(243, 36, 79, 0.4)';
      }

      squares.push(
        <Rect
          key={`square-${i}`}
          x={i * questionWidth}
          y={0}
          width={questionWidth}
          height={height}
          fill={squareColor}
        />,
      );
    }
    return squares;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: height,
          width: fullWidth,
        },
      ]}
      onLayout={event => {
        setComponentWidth(event.nativeEvent.layout.width);
      }}
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${componentWidth} ${height}`}>
        <Rect width="100%" height={height} fill={backgroundColor} rx={4} ry={4} />
        {renderSquares()}
      </Svg>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.button,
            buttonStyle,
            {
              top: -(40 - height) / 2,
            },
          ]}
        >
          <View style={[styles.buttonCircle, { backgroundColor: progressColor }]}>
            <ThemedText style={[styles.buttonText, { color: buttonColor, fontFamily: 'arial' }]}>
              {currentQuestionIndex + 1}/{totalQuestions}
            </ThemedText>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  button: {
    position: 'absolute',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCircle: {
    width: 70,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default QuestionSlider;
