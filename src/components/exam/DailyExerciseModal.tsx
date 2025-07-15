import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Text, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import BackButtonSVG from '@/assets/images/back-start-exam.svg';
import NewDailyExercise from '@/assets/images/new-daily-exercise.svg';
import CapsuleButton from '@/components/common/CapsuleButton';
import RotatingBadge from '../common/RotatingBadge';

interface DailyExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCount: number | null;
  onSelectCount: (count: number) => void;
  onStartNow: () => void;
  dailyExerciseData: DailyExerciseSession | null;
  onResetSelection?: () => void; // Add optional reset function
}

const StartNowButton = ({ onPress }: { onPress: () => void }) => (
  <View className={'self-center'}>
    <CapsuleButton className={'w-[200px]'} text={'START NOW'} onPress={onPress} />
  </View>
);

// Question Count Button Component
const QuestionCountButton = ({
  count,
  onPress,
  isLoading,
  disabled,
}: {
  count: number;
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
}) => {
  return (
    <TouchableOpacity
      className={`flex w-full border border-2 border-white rounded-full py-[15px] items-center my-2 ${
        disabled ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="flex-row justify-center items-center">
        {isLoading && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
        <ThemedText className="text-white text-[20px]">{count} Questions</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const DailyExerciseModal: React.FC<DailyExerciseModalProps> = ({
  visible,
  onClose,
  selectedCount,
  onSelectCount,
  onStartNow,
  dailyExerciseData,
  onResetSelection,
}) => {
  const [loadingCount, setLoadingCount] = useState<number | null>(null);
  const questionCounts = [15, 30, 45];

  const handleSelectCount = async (count: number) => {
    setLoadingCount(count);
    try {
      await onSelectCount(count);
    } finally {
      setLoadingCount(null);
    }
  };

  const handleBackToQuestionSelection = () => {
    // Use the reset function if provided, otherwise fallback to onClose
    if (onResetSelection) {
      onResetSelection();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View
        className="flex flex-1 flex-column"
        style={{
          backgroundColor: 'rgba(0, 182, 254, 0.97)',
        }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={selectedCount ? handleBackToQuestionSelection : onClose}
            className="flex-1 items-end"
          >
            <BackButtonSVG />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center">
          <RotatingBadge color="#FF3378">
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ rotate: '-16deg' }],
              }}
            >
              <ThemedText
                className="text-white text-[24px] w-[180px] text-center"
                style={{ fontWeight: 'bold' }}
              >
                NEW!
              </ThemedText>
            </View>
          </RotatingBadge>
        </View>

        <View className="flex px-8">
          <ThemedText className="mb-8 text-6xl text-white">Daily Exercise</ThemedText>
          {selectedCount ? (
            <View className="flex flex-column">
              <View className="flex py-3 border-t border-b border-white flex-column">
                <ThemedText className="text-white text-[14px]">
                  YOUR DAILY EXERCISE AVERAGE SCORE
                </ThemedText>
                <ThemedText className="text-white text-[18px]">
                  {dailyExerciseData?.userStats?.averageScore?.toFixed(2)}
                </ThemedText>
              </View>
              <View className="flex py-3 border-b border-white flex-column">
                <ThemedText className="text-white text-[14px]">YOUR PREVIOUS SCORE</ThemedText>
                <ThemedText className="text-white text-[18px]">
                  {dailyExerciseData?.userStats?.latestScore}/100
                </ThemedText>
              </View>
            </View>
          ) : (
            <View className="mb-32">
              {questionCounts.map(count => (
                <QuestionCountButton
                  key={count}
                  count={count}
                  onPress={() => handleSelectCount(count)}
                  isLoading={loadingCount === count}
                  disabled={loadingCount !== null}
                />
              ))}
            </View>
          )}
        </View>
        {selectedCount && (
          <View className="flex-1 justify-end items-center pb-16">
            <StartNowButton onPress={onStartNow} />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default DailyExerciseModal;
