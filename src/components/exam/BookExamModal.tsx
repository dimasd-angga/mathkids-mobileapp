import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import BackButtonSVG from '@/assets/images/back-start-exam.svg';
import ReadyToBegin from '@/assets/images/ready-to-begin.svg';
import CapsuleButton from '@/components/common/CapsuleButton';
import { ExamItem } from '@/types/exams.types';
import RotatingBadge from '../common/RotatingBadge';
import { ScrollView } from 'react-native-gesture-handler';

interface BookExamModalProps {
  visible: boolean;
  onClose: () => void;
  selectedExam: ExamItem | null;
  onStartNow: () => void;
  isLoading: boolean;
}

const StartNowButton = ({ onPress, isLoading }: { onPress: () => void; isLoading: boolean }) => {
  return (
    <View className={'self-center'}>
      <CapsuleButton
        isLoading={isLoading}
        className={'w-[300px]'}
        text={'START NOW'}
        onPress={onPress}
      />
    </View>
  );
};

const BookExamModal: React.FC<BookExamModalProps> = ({
  visible,
  onClose,
  selectedExam,
  onStartNow,
  isLoading,
}) => {
  console.log({ selectedExam });
  const applyOpacity = (hexColor: string, opacity: number = 0.97) => {
    if (!hexColor) return 'rgba(0, 0, 0, 0.97)';

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const adjustedFontSize = selectedExam && selectedExam?.title?.length > 30 ? 38 : 48;

  console.log({ selectedExam });
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View
        className="flex flex-1 flex-column"
        style={{
          backgroundColor: selectedExam
            ? applyOpacity(selectedExam.book.color)
            : 'rgba(0, 0, 0, 0.97)',
        }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={onClose} className="flex-1 items-end">
            <BackButtonSVG />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center" />
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
                {selectedExam?.highestScore === 100 ? 'Done\n&\nDusted' : 'Ready to\nBegin?'}
              </ThemedText>
            </View>
          </RotatingBadge>
        </View>
        <View className="flex-1 justify-center items-center" />
        <View className="justify-center px-8">
          {selectedExam && (
            <>
              <ScrollView className="my-5 min-h-80 max-h-80">
                <ThemedText className={`text-white`} style={{ fontSize: adjustedFontSize }}>
                  {selectedExam.title}
                </ThemedText>
                <View>
                  {selectedExam.book.desc && (
                    <ThemedText className="mt-4 text-3xl text-white">
                      {selectedExam.book.desc}
                    </ThemedText>
                  )}
                  {selectedExam.book.question_types?.length > 0 && (
                    <View className="mt-4">
                      <ThemedText className="text-xl font-bold text-white">Topics:</ThemedText>
                      {selectedExam.book.question_types.map((type, index) => (
                        <ThemedText key={index} className="text-lg text-white">
                          • {type}
                        </ThemedText>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
              <View className="flex py-3 flex-column">
                <ThemedText className="text-white text-[12px]" style={{ fontFamily: 'Helvetica' }}>
                  YOUR PREVIOUS SCORE
                </ThemedText>
                <ThemedText
                  className="text-white text-[20px]"
                  style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}
                >
                  {selectedExam.latestScore ?? 0}/100
                </ThemedText>
              </View>
            </>
          )}
        </View>

        <View className="items-center mb-16">
          <StartNowButton onPress={onStartNow} isLoading={isLoading} />
        </View>
      </View>
    </Modal>
  );
};

export default BookExamModal;
