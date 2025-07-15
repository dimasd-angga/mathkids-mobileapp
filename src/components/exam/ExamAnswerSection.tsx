import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Keyboard,
  Animated,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import CapsuleButton from '@/components/common/CapsuleButton';
import { LinearGradient } from 'expo-linear-gradient';
import CustomNumericKeyboard from '@/components/common/CustomNumericKeyboard';

type ExamAnswerSectionProps = {
  initialAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onBack: (answer: string) => void;
  onSkip: () => void;
  onNext: (answer: string) => void;
  isFirstQuestion: boolean;
  disableSkip?: boolean;
  isSkipped?: boolean;
  questionIndex: number;
  totalQuestions: number;
};

const ExamAnswerSection: React.FC<ExamAnswerSectionProps> = ({
  initialAnswer,
  isCorrect,
  isLastQuestion,
  isSubmitting,
  onBack,
  onSkip,
  onNext,
  isFirstQuestion,
  disableSkip,
  isSkipped = false,
  questionIndex,
  totalQuestions,
}) => {
  const [answer, setAnswer] = useState(initialAnswer);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [customKeyboardVisible, setCustomKeyboardVisible] = useState(false);

  // Keep track of previous question index to detect navigation
  const prevQuestionIndexRef = useRef(questionIndex);

  // Animation for floating input (no longer needed but keeping for potential future use)
  const floatingAnimation = useRef(new Animated.Value(0)).current;

  // Update answer status
  useEffect(() => {
    if (isSkipped) {
      setAnswerStatus(null);
    } else if (isCorrect !== undefined && initialAnswer.trim()) {
      setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    } else {
      setAnswerStatus(null);
    }
  }, [isCorrect, initialAnswer, isSkipped]);

  // Update answer when question changes but DON'T close keyboard
  useEffect(() => {
    // Only update answer, don't touch keyboard state
    setAnswer(initialAnswer);

    // Update the previous question index reference
    prevQuestionIndexRef.current = questionIndex;
  }, [questionIndex, initialAnswer]);

  // Handle device keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      // If device keyboard shows, hide custom keyboard
      setCustomKeyboardVisible(false);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleAnswerAreaPress = () => {
    // Dismiss device keyboard first
    Keyboard.dismiss();
    // Show custom keyboard
    setTimeout(() => {
      setCustomKeyboardVisible(true);
    }, 100);
  };

  const handleKeyPress = (key: string) => {
    if (answerStatus === 'correct') return;

    setAnswer(prev => prev + key);
    setAnswerStatus(null);
  };

  const handleBackspace = () => {
    if (answerStatus === 'correct') return;

    setAnswer(prev => prev.slice(0, -1));
    setAnswerStatus(null);
  };

  const handleCustomKeyboardClose = () => {
    setCustomKeyboardVisible(false);
  };

  const getInputBorderColor = () => {
    if (answerStatus === 'correct') return '#63FF36';
    if (answerStatus === 'incorrect') return '#ef4444';
    return '#d1d5db';
  };

  const handleSkipPress = () => {
    // Keep keyboard open - just navigate
    onSkip();
  };

  const handleBackPress = () => {
    // Keep keyboard open - just navigate with current answer
    onBack(answer);
  };

  const handleNextPress = () => {
    // Keep keyboard open - just navigate with current answer
    onNext(answer);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#331D0E', '#66391B']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.mainContainer}
      >
        <View style={styles.answerSection}>
          <ThemedText style={styles.title}>ANSWER HERE</ThemedText>

          <TouchableOpacity
            style={[styles.answerBox, { borderColor: getInputBorderColor() }]}
            onPress={handleAnswerAreaPress}
            disabled={answerStatus === 'correct'}
            activeOpacity={0.8}
          >
            <Text style={styles.answerText}>{answer || ''}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.navigationButton, { opacity: isFirstQuestion ? 0.5 : 1 }]}
            onPress={handleBackPress}
            disabled={isFirstQuestion}
          >
            <FontAwesome5 name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="w-28">
            <TouchableOpacity
              disabled={disableSkip}
              className={`w-28 h-16 rounded-full border-2 border-white justify-center items-center ${disableSkip ? 'opacity-50' : ''}`}
              onPress={handleSkipPress}
            >
              <ThemedText className="text-white text-[20px] font-bold">SKIP</ThemedText>
            </TouchableOpacity>
          </View>

          <View className="w-28">
            <CapsuleButton
              disabled={answer.trim() === '' || isSubmitting}
              className={'w-28'}
              onPress={handleNextPress}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : isLastQuestion ? (
                <ThemedText className="text-white text-[16px] font-bold">FINISH</ThemedText>
              ) : (
                <FontAwesome5 name="chevron-right" size={24} color="#fff" />
              )}
            </CapsuleButton>
          </View>
        </View>
      </LinearGradient>

      <CustomNumericKeyboard
        visible={customKeyboardVisible}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClose={handleCustomKeyboardClose}
        answer={answer}
        onBack={handleBackPress}
        onNext={handleNextPress}
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        isSubmitting={isSubmitting}
        inputBorderColor={getInputBorderColor()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  answerSection: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  answerBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 180,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  answerText: {
    fontSize: 48,
    fontFamily: 'CooperBlack',
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  navigationButton: {
    width: 100,
    height: 58,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    width: 100,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0082FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ExamAnswerSection;
