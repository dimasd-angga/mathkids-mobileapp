import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemedText } from '@/contexts/ThemeProvider';
import { ActivityIndicator } from 'react-native';

const LeftSvgMark = () => (
  <Svg
    width="16"
    height="35"
    viewBox="0 0 16 35"
    fill="none"
    style={{ position: 'absolute', left: 0, top: '50%', transform: [{ translateY: -17.5 }] }}
  >
    <Path
      d="M4.89823 34.6822C4.48862 34.8607 4.00828 34.7252 3.76537 34.3502C1.45294 30.7802 0.170326 26.8427 0.015831 22.8239C-0.138268 18.8155 0.834061 14.8334 2.85727 11.1659C3.07867 10.7645 3.56328 10.5957 3.99249 10.7565C4.54482 10.9635 4.77425 11.6193 4.49805 12.1404C2.71838 15.4986 1.86652 19.1255 2.00684 22.7756C2.14729 26.429 3.27807 30.0111 5.31584 33.2791C5.62716 33.7784 5.43763 34.4471 4.89823 34.6822Z"
      fill="#FFFFFF"
    />
    <Path
      d="M6.99187 7.55511C6.37846 7.22704 6.22375 6.41595 6.69876 5.90775C8.74687 3.71651 11.2024 1.78359 13.9822 0.17569C14.3913 -0.060955 14.9089 0.0327988 15.2189 0.389534C15.6393 0.873272 15.5048 1.62112 14.955 1.95047C12.4289 3.46367 10.2025 5.26972 8.3508 7.30844C8.00497 7.68918 7.44543 7.79769 6.99187 7.55511Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const RightSvgMark = () => (
  <Svg
    width="16"
    height="35"
    viewBox="0 0 16 35"
    fill="none"
    style={{ position: 'absolute', right: 0, top: '50%', transform: [{ translateY: -17.5 }] }}
  >
    <Path
      d="M11.1018 0.317822C11.5114 0.13932 11.9917 0.274807 12.2346 0.649821C14.5471 4.2198 15.8297 8.15733 15.9842 12.1761C16.1383 16.1845 15.1659 20.1666 13.1427 23.8341C12.9213 24.2355 12.4367 24.4043 12.0075 24.2435C11.4552 24.0365 11.2258 23.3807 11.5019 22.8596C13.2816 19.5014 14.1335 15.8745 13.9932 12.2244C13.8527 8.57098 12.7219 4.98891 10.6842 1.72086C10.3728 1.22158 10.5624 0.552885 11.1018 0.317822Z"
      fill="#FFFFFF"
    />
    <Path
      d="M9.00813 27.4449C9.62154 27.773 9.77625 28.584 9.30124 29.0923C7.25313 31.2835 4.79765 33.2164 2.01785 34.8243C1.60873 35.061 1.0911 34.9672 0.781075 34.6105C0.360668 34.1267 0.495152 33.3789 1.04495 33.0495C3.57107 31.5363 5.79746 29.7303 7.6492 27.6916C7.99503 27.3108 8.55457 27.2023 9.00813 27.4449Z"
      fill="#FFFFFF"
    />
  </Svg>
);

interface CapsuleButtonProps {
  text?: string;
  children?: React.ReactNode;
  onPress: () => void;
  width?: number | 'auto';
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: any;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}
const CapsuleButton: React.FC<CapsuleButtonProps> = ({
  text,
  onPress,
  width = 'auto',
  height = 54,
  backgroundColor = '#0082FC',
  textColor = 'white',
  style,
  className,
  disabled = false,
  isLoading = false,
  children,
}) => {
  const widthStyle = width === 'auto' ? { alignSelf: 'flex-start' } : { width };

  return (
    <View
      className={className}
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          borderRadius: 27,
          backgroundColor: 'transparent',
        },
        widthStyle,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          borderRadius: 27,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          backgroundColor: disabled ? 'lightslategrey' : backgroundColor,
          paddingHorizontal: 16,
        }}
      >
        <View className={'absolute top-[22px] left-[5px]'}>
          <LeftSvgMark />
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : children ? (
          children
        ) : (
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: textColor,
              paddingHorizontal: 8,
              textAlign: 'center',
            }}
          >
            {text}
          </ThemedText>
        )}

        <View className={'absolute top-[31px] right-[5px]'}>
          <RightSvgMark />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CapsuleButton;
