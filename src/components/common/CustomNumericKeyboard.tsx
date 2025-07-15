import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface CustomNumericKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onDone?: () => void;
  visible: boolean;
  onClose: () => void;
  // Floating input props
  answer: string;
  onBack: () => void;
  onNext: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  inputBorderColor: string;
}

const CustomNumericKeyboard: React.FC<CustomNumericKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onDone,
  visible,
  onClose,
  answer,
  onBack,
  onNext,
  isFirstQuestion,
  isLastQuestion,
  isSubmitting,
  inputBorderColor,
}) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['close', '0', 'backspace'],
  ];

  const KeyButton: React.FC<{
    keyValue: string;
    isBackspace?: boolean;
    isClose?: boolean;
    isEmpty?: boolean;
  }> = ({ keyValue, isBackspace = false, isClose = false, isEmpty = false }) => {
    if (isEmpty) {
      return <View style={styles.emptyKey} />;
    }

    return (
      <TouchableOpacity
        style={[
          styles.keyButton,
          isBackspace ? styles.backspaceButton : isClose ? styles.closeButton : styles.numberButton,
        ]}
        onPress={() => {
          if (isBackspace) {
            onBackspace();
          } else if (isClose) {
            onClose();
          } else {
            onKeyPress(keyValue);
          }
        }}
        activeOpacity={0.2}
      >
        {isBackspace ? (
          <FontAwesome5 name="backspace" size={20} color="#000" />
        ) : isClose ? (
          <Text style={{ ...styles.keyText, fontSize: 20, fontWeight: 'bold' }}>Close</Text>
        ) : (
          <Text style={styles.keyText}>{keyValue}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  const keyboardHeight = 310;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <View style={styles.transparentArea} />

        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.keyboardWrapper}>
            <View style={styles.floatingInputSection}>
              <View style={styles.floatingInputContainer}>
                <TouchableOpacity
                  style={[styles.floatingBackButton, { opacity: isFirstQuestion ? 0.5 : 1 }]}
                  onPress={onBack}
                  disabled={isFirstQuestion}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name="chevron-left" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={[styles.floatingInputBox, { borderColor: inputBorderColor }]}>
                  <Text style={styles.floatingInputText}>{answer || ''}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.floatingNextButton,
                    { opacity: answer.trim() === '' && !isLastQuestion ? 0.5 : 1 },
                  ]}
                  onPress={onNext}
                  disabled={answer.trim() === '' && !isLastQuestion}
                  activeOpacity={0.7}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : isLastQuestion ? (
                    <FontAwesome5 name="check" size={20} color="#fff" />
                  ) : (
                    <FontAwesome5 name="chevron-right" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View
              style={[
                styles.keyboardContainer,
                {
                  height: keyboardHeight,
                  transform: [
                    {
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [keyboardHeight, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.keyboardContent}>
                {keys.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keyRow}>
                    {row.map((key, keyIndex) => (
                      <KeyButton
                        key={keyIndex}
                        keyValue={key}
                        isBackspace={key === 'backspace'}
                        isClose={key === 'close'}
                        isEmpty={key === ''}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1002,
    justifyContent: 'flex-end',
  },
  transparentArea: {
    flex: 1,
  },
  keyboardWrapper: {
    // This area won't close the keyboard when tapped
  },
  floatingInputSection: {
    backgroundColor: 'rgba(51, 29, 14, 1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  floatingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  floatingBackButton: {
    height: 54,
    width: 54,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  floatingInputBox: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 3,
    backgroundColor: 'white',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingInputText: {
    fontSize: 20,
    fontFamily: 'CooperBlack',
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  floatingNextButton: {
    backgroundColor: '#0082FC',
    height: 54,
    width: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  keyboardContainer: {
    backgroundColor: Platform.OS === 'ios' ? '#D1D5DB' : '#E5E7EB',
  },
  keyboardContent: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    justifyContent: 'space-evenly',
    fontFamily: 'CooperBlack',
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyKey: {
    flex: 1,
    margin: 8,
  },
  keyButton: {
    flex: 1,
    height: 54,
    margin: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  backspaceButton: {
    backgroundColor: '#AEB3BB',
  },
  closeButton: {
    backgroundColor: '#ef4444',
  },
  numberButton: {
    backgroundColor: '#FFFFFF',
  },
  keyText: {
    fontSize: 28,
    fontFamily: 'CooperBlack',
    color: '#000',
  },
});

export default CustomNumericKeyboard;
