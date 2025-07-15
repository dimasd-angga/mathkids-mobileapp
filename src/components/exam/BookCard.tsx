import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import Svg, { Path, Rect, G, Defs, ClipPath } from 'react-native-svg';
import { ExamItem } from '@/types/exams.types';
import { ThemedText } from '@/contexts/ThemeProvider';

const LockIcon = () => (
  <Svg width="81" height="80" viewBox="0 0 81 80" fill="none">
    <Path
      d="M40.3691 25.8333C34.0691 25.8333 32.8691 28.4666 32.8691 33.3333V35.3999H47.8691V33.3333C47.8691 28.4666 46.6691 25.8333 40.3691 25.8333Z"
      fill="white"
    />
    <Path
      d="M40.3693 50.3333C42.3943 50.3333 44.036 48.6917 44.036 46.6667C44.036 44.6416 42.3943 43 40.3693 43C38.3443 43 36.7026 44.6416 36.7026 46.6667C36.7026 48.6917 38.3443 50.3333 40.3693 50.3333Z"
      fill="white"
    />
    <Path
      d="M40.369 6.66675C21.969 6.66675 7.03564 21.6001 7.03564 40.0001C7.03564 58.4001 21.969 73.3334 40.369 73.3334C58.769 73.3334 73.7023 58.4001 73.7023 40.0001C73.7023 21.6001 58.769 6.66675 40.369 6.66675ZM58.3023 48.3334C58.3023 55.6668 56.0356 57.9334 48.7023 57.9334H32.0356C24.7023 57.9334 22.4356 55.6668 22.4356 48.3334V45.0001C22.4356 39.3001 23.8023 36.6667 27.869 35.7667V33.3334C27.869 30.2334 27.869 20.8334 40.369 20.8334C52.869 20.8334 52.869 30.2334 52.869 33.3334V35.7667C56.9356 36.6667 58.3023 39.3001 58.3023 45.0001V48.3334Z"
      fill="white"
    />
  </Svg>
);

const BookSVG = ({
  mainColor = '#00BB98',
  accentColor = '#37EDB9',
  title = '',
  isLocked = false,
  latestScore = 0,
}) => {
  return (
    <View
      className={'relative'}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width="178" height="187" viewBox="0 0 178 187" fill="none">
        <Defs>
          <ClipPath id="clip0">
            <Path
              d="M0 17C0 7.61115 7.61116 0 17 0H178V187H15C6.71573 187 0 180.284 0 172V17Z"
              fill="white"
            />
          </ClipPath>
        </Defs>
        <G clipPath="url(#clip0)">
          <Path
            d="M0 17C0 7.61115 7.61116 0 17 0H178V187H15C6.71573 187 0 180.284 0 172V17Z"
            fill={mainColor}
          />
          <Rect width="13.0645" height="188.71" fill={accentColor} />
          <Path
            d="M15.7041 157.516H177V186H14.7803C7.16985 186 1.00015 179.831 1 172.22C1 164.1 7.58341 157.516 15.7041 157.516Z"
            fill="white"
            stroke="#CBCBCB"
            strokeWidth="2"
          />
          <Rect x="5" y="161" width="172" height="2" fill="#CBCBCB" />
          <Rect x="3" y="165" width="174" height="2" fill="#CBCBCB" />
          <Rect x="5" y="181" width="172" height="2" fill="#CBCBCB" />
          <Rect x="2" y="177" width="175" height="2" fill="#CBCBCB" />
          <Rect x="2" y="173" width="175" height="2" fill="#CBCBCB" />
          <Rect x="2" y="169" width="175" height="2" fill="#CBCBCB" />
        </G>
      </Svg>

      <View className="items-center absolute ">
        <View className="flex flex-col gap-2 -mt-10">
          <ThemedText className="text-[20px] text-white">{title}</ThemedText>
          <ThemedText className="text-white text-sm" style={{ fontFamily: 'Helvetica' }}>
            {latestScore?.toString() ?? '0'}/100
          </ThemedText>
        </View>
      </View>

      {isLocked && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 8,
          }}
        >
          <LockIcon />
        </View>
      )}
    </View>
  );
};

const BookCard = ({
  item,
  handleBookPress,
}: {
  item: ExamItem;
  handleBookPress: (item: ExamItem) => void;
}) => {
  const mainColor = item.book.color || '#00BB98';
  const accentColor = createLighterColor(mainColor);
  const isLocked = item.status === 'closed';

  return (
    <TouchableOpacity
      style={[styles.bookItem, isLocked && styles.disabledBook]}
      onPress={() => !isLocked && handleBookPress(item)}
      disabled={isLocked}
      activeOpacity={isLocked ? 1 : 0.7}
    >
      <View
        className={'relative'}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8, // Add this
          overflow: 'hidden', // Add this
        }}
      >
        <BookSVG
          mainColor={mainColor}
          accentColor={accentColor}
          title={item.book.title}
          isLocked={isLocked}
          latestScore={item.latestScore}
        />
      </View>
    </TouchableOpacity>
  );
};

const createLighterColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lightR = Math.min(255, Math.floor(r * 1.3));
  const lightG = Math.min(255, Math.floor(g * 1.3));
  const lightB = Math.min(255, Math.floor(b * 1.3));
  return (
    '#' +
    lightR.toString(16).padStart(2, '0') +
    lightG.toString(16).padStart(2, '0') +
    lightB.toString(16).padStart(2, '0')
  );
};

const styles = StyleSheet.create({
  bookItem: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBook: {
    opacity: 0.6,
  },
  svgContainer: {
    width: 178,
    height: 187,
  },
});

export default BookCard;
