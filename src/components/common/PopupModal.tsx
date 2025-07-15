import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { ThemedText } from '@/contexts/ThemeProvider';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const ANIMATION_DURATION = 300;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 1,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};

const ANIMATION_TYPES = {
  FADE: 'fade',
  SLIDE: 'slide',
  SCALE: 'scale',
  BOUNCE: 'bounce',
  FLIP: 'flip',
  ROTATION: 'rotation',
};

const POSITION_TYPES = {
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom',
};

const PopupModal = ({
  visible,
  onClose,
  title = 'Popup Title',
  message = 'This is a popup message',
  primaryButtonText = 'OK',
  secondaryButtonText = 'Cancel',
  onPrimaryButtonPress = () => {},
  onSecondaryButtonPress = null,
  animationType = ANIMATION_TYPES.FADE,
  position = POSITION_TYPES.CENTER,
  backdropOpacity = 0.5,
  closeOnBackdropPress = true,
  showCloseIcon = true,
  headerElement = null,
  customButtons = null,
  containerClassName = '',
  popupClassName = 'bg-white rounded-xl p-5 shadow-lg w-4/5',
  titleClassName = 'text-lg font-bold mb-2 text-center text-gray-800',
  messageClassName = 'text-base text-gray-600 text-center mb-5',
  primaryButtonClassName = 'flex-1 bg-blue-500 py-3 rounded-lg mx-1 items-center justify-center',
  primaryButtonTextClassName = 'text-white font-semibold text-base',
  secondaryButtonClassName = 'flex-1 bg-gray-200 py-3 rounded-lg mx-1 items-center justify-center',
  secondaryButtonTextClassName = 'text-gray-800 font-semibold text-base',
  closeIconClassName = 'text-2xl font-bold text-gray-500',
  headerClassName = 'mb-3',
}) => {
  // Animation shared values
  const progress = useSharedValue(0);
  const backdropProgress = useSharedValue(0);
  const slideY = useSharedValue(getInitialSlidePosition());
  const scale = useSharedValue(0.8);
  const rotateZ = useSharedValue(0);
  const flipY = useSharedValue(0);

  // Helper function to determine initial slide position based on modal position
  function getInitialSlidePosition() {
    switch (position) {
      case POSITION_TYPES.TOP:
        return -SCREEN_HEIGHT * 0.3;
      case POSITION_TYPES.BOTTOM:
        return SCREEN_HEIGHT * 0.3;
      default:
        return 0;
    }
  }

  // Run animations when visibility changes
  useEffect(() => {
    if (visible) {
      // Reset values for entrance animations
      switch (animationType) {
        case ANIMATION_TYPES.SLIDE:
          slideY.value = getInitialSlidePosition();
          break;
        case ANIMATION_TYPES.SCALE:
          scale.value = 0.8;
          break;
        case ANIMATION_TYPES.BOUNCE:
          scale.value = 0.3;
          break;
        case ANIMATION_TYPES.FLIP:
          flipY.value = 1;
          break;
        case ANIMATION_TYPES.ROTATION:
          rotateZ.value = -0.25;
          break;
      }

      progress.value = 0;
      backdropProgress.value = 0;

      // Animate backdrop
      backdropProgress.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.quad),
      });

      // Animate popup based on animation type
      switch (animationType) {
        case ANIMATION_TYPES.SLIDE:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          slideY.value = withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.SCALE:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          scale.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.BOUNCE:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          scale.value = withSpring(1, SPRING_CONFIG);
          break;

        case ANIMATION_TYPES.FLIP:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          flipY.value = withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.inOut(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.ROTATION:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          rotateZ.value = withTiming(0, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.FADE:
        default:
          progress.value = withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          });
          break;
      }
    } else {
      // Exit animations
      backdropProgress.value = withTiming(0, {
        duration: ANIMATION_DURATION / 2,
        easing: Easing.in(Easing.quad),
      });

      switch (animationType) {
        case ANIMATION_TYPES.SLIDE:
          progress.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          slideY.value = withTiming(getInitialSlidePosition(), {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.SCALE:
        case ANIMATION_TYPES.BOUNCE:
          progress.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          scale.value = withTiming(0.8, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.FLIP:
          progress.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          flipY.value = withTiming(1, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.ROTATION:
          progress.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          rotateZ.value = withTiming(0.25, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          break;

        case ANIMATION_TYPES.FADE:
        default:
          progress.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });
          break;
      }
    }
  }, [visible, animationType, position]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const getContainerPositionStyle = () => {
    switch (position) {
      case POSITION_TYPES.TOP:
        return styles.topContainer;
      case POSITION_TYPES.BOTTOM:
        return styles.bottomContainer;
      default:
        return styles.centerContainer;
    }
  };

  // Backdrop animated style
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropProgress.value * backdropOpacity,
    };
  });

  // Modal animated style
  const modalAnimatedStyle = useAnimatedStyle(() => {
    const opacity = progress.value;

    // Create different transform styles based on the animation type
    const transformStyles = [];

    switch (animationType) {
      case ANIMATION_TYPES.SLIDE:
        transformStyles.push({ translateY: slideY.value });
        break;
      case ANIMATION_TYPES.SCALE:
      case ANIMATION_TYPES.BOUNCE:
        transformStyles.push({ scale: scale.value });
        break;
      case ANIMATION_TYPES.FLIP:
        transformStyles.push({
          rotateY: `${interpolate(flipY.value, [0, 1], [0, 180], Extrapolate.CLAMP)}deg`,
        });
        break;
      case ANIMATION_TYPES.ROTATION:
        transformStyles.push({
          rotateZ: `${interpolate(rotateZ.value, [-0.25, 0, 0.25], [-90, 0, 90], Extrapolate.CLAMP)}deg`,
          scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.05, 1], Extrapolate.CLAMP),
        });
        break;
    }

    return {
      opacity,
      transform: transformStyles,
    };
  });

  // Render default buttons
  const renderDefaultButtons = () => (
    <View style={styles.buttonContainer}>
      {onSecondaryButtonPress && (
        <TouchableOpacity
          className={secondaryButtonClassName}
          onPress={() => {
            onSecondaryButtonPress();
            onClose();
          }}
        >
          <Text className={secondaryButtonTextClassName}>{secondaryButtonText}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className={primaryButtonClassName}
        onPress={() => {
          onPrimaryButtonPress();
          onClose();
        }}
      >
        <Text className={primaryButtonTextClassName}>{primaryButtonText}</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View
        style={[styles.mainContainer, getContainerPositionStyle()]}
        className={containerClassName}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[modalAnimatedStyle]} className={popupClassName}>
          {showCloseIcon && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text className={closeIconClassName}>×</Text>
            </TouchableOpacity>
          )}

          {headerElement && <View className={headerClassName}>{headerElement}</View>}

          <View style={styles.contentContainer}>
            {title && (
              <ThemedText variant={'title'} className={titleClassName}>
                {title}
              </ThemedText>
            )}
            {message && <ThemedText className={messageClassName}>{message}</ThemedText>}
          </View>

          {customButtons || renderDefaultButtons()}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
  },
  topContainer: {
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    paddingBottom: 80,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  contentContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 10,
  },
});

export const PopupAnimationTypes = ANIMATION_TYPES;
export const PopupPositionTypes = POSITION_TYPES;

export default PopupModal;
