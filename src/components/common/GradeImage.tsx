import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import MountainEverest from '@/assets/images/mountain-everest.svg';
import MountainJayaWijaya from '@/assets/images/mountain-jaya-wijaya.svg';
import MountainAcon from '@/assets/images/mountain-acon.svg';
import MountainDenali from '@/assets/images/mountain-denali.svg';
import reportStore from '@/stores/reportStore';
import { ThemedText } from '@/contexts/ThemeProvider';

const GradeImage = ({ data }: {
  data?: {
    exam_index: number;
    index: number
  }
}) => {
  const { examGradeMilestones, examGradeMilestoneExamsById } = reportStore();
  const IMG_CONTAINER_SIZE = 104;
  const IMG_SIZE = IMG_CONTAINER_SIZE + 86;
  const gradeIndex = examGradeMilestones.findIndex(
    grade => grade.title === examGradeMilestoneExamsById?.grade?.title,
  );

  const renderImage = () => {
    const caseIndex = data?.index || (gradeIndex + 1)
    switch (caseIndex.toString()) {
      case '1':
        return (
          <MountainJayaWijaya
            style={{marginTop: -12}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      case '2':
        return (
          <MountainDenali
            style={{marginTop: -12}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      case '3':
        return (
          <MountainAcon
            style={{marginTop: -12}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      default:
        return (
          <MountainEverest
            style={{marginTop: -12}}
            width={IMG_SIZE} height={IMG_SIZE} />
        );
    }
  };
  return (
    <TouchableOpacity
      disabled
      onPress={() => { }}
      className="relative mb-2 rounded-full border-[6px] border-white"
      style={{
        backgroundColor: '#E8BA00',
      }}
    >
      <View
        className="overflow-hidden rounded-full"
        style={{
          height: IMG_CONTAINER_SIZE,
          width: IMG_CONTAINER_SIZE,
          alignItems: 'center',
          // justifyContent: 'flex-start',
        }}
      >
        {renderImage()}
      </View>
      <View className="absolute -right-6 -bottom-4 justify-center items-center w-[52px] h-[52px] bg-pink-500 rounded-full border-4 border-white">
        <ThemedText className="text-xl font-bold text-white">
          {data?.exam_index || examGradeMilestoneExamsById?.exam_index}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default GradeImage;
