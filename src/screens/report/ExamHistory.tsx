import { View, Text, ScrollView, Image, TouchableOpacity, Animated } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackSVG from '@/assets/images/back-assesment-detail.svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, ExamHistoryRouteProp } from '@/navigation/NavigationTypes'; // adjust if path is different
import MountainMilestoneImage from '@/assets/images/mountain-milestone.png';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import GradeImage from '@/components/common/GradeImage';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_WIDTH } from '@/utils/constant';
import Constants from 'expo-constants';
import BackFlip from '@/components/common/BackFlip';
import UserInfoText from '@/components/common/UserInfoText';
import reportStore from '@/stores/reportStore';
import authStore from '@/stores/authStore';
import { toRoman } from '@/hooks/useRoman';
import { useMemo } from 'react';
const statusBarHeight = Constants.statusBarHeight;
const HEADER_HEIGHT = 160 + 48 + 150; // pt-10 (160) + pb-12 (48) + image+text (estimate 64)

type ExamHistoryScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ExamHistory'>;

export default function ExamHistoryScreen() {
  const { user } = authStore();
  const { userResult } = useRoute<ExamHistoryRouteProp>().params;
  const { examGradeMilestones, examGradeMilestoneExamsById } = reportStore();
  const navigation = useNavigation<ExamHistoryScreenNavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerPointerEvents, setHeaderPointerEvents] = useState<'auto' | 'none'>('auto');

  const gradeIndex = examGradeMilestones.findIndex(
    grade => grade.title === examGradeMilestoneExamsById?.grade?.title,
  );

  let isArray = false;
  // console.log(
  //   'examGradeMilestones',
  //   examGradeMilestones,
  //   gradeIndex,
  //   examGradeMilestones[gradeIndex],
  //   examGradeMilestoneExamsById?.grade?.title,
  // );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, -160],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setHeaderPointerEvents(value < 35 ? 'auto' : 'none');
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  // console.log('user', user?.grade, JSON.stringify(userResult));
  const userResultByAttempt = useMemo(() => userResult.sort((a, b) => b.attempt - a.attempt), [userResult]);

  return (
    <View className="flex-1 bg-[#FFFFBE]">
      <BackFlip />
      <View style={{ flex: 1 }}>
        <Animated.View
          pointerEvents={headerPointerEvents}
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            alignItems: 'center',
            paddingTop: 120,
          }}
        >
          <GradeImage />
          <ThemedText className="text-2xl text-black">
            {examGradeMilestones[gradeIndex].desc}{' '}
            {examGradeMilestoneExamsById?.exam_index
              ? // toRoman(examGradeMilestoneExamsById?.exam_index)
                examGradeMilestoneExamsById?.exam_index
              : '-'}
          </ThemedText>
          <UserInfoText style={{ color: 'black', fontSize: 18 }}>Assessment History</UserInfoText>
        </Animated.View>

        <Animated.FlatList
          data={userResultByAttempt.slice(0, 10)}
          className={'px-6'}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('AssesmentDetail', { assessment: item })}
                key={index}
                className={`flex-row bg-[#FFC41D] w-full justify-between items-center border-4 border-[#FFDC00] py-2 rounded-3xl px-5 mt-1 ${index === 0 ? 'mt-3' : 'mt-1'}`}
              >
                <ThemedText className="text-lg text-black">Attempt {item.attempt}</ThemedText>
                <View className="items-center">
                  <Text className="text-sm font-bold text-black">
                    {moment(item.publishedAt).format('DD/MM/YYYY')}
                  </Text>
                  <View className="items-center px-2 py-1 mt-1 bg-white rounded-md">
                    <Text className="text-xs font-semibold text-[#FFC41D]">
                      {moment(item.publishedAt).format('HH:mm')}
                    </Text>
                  </View>
                </View>
                <ThemedText className="text-lg text-black">{item.score}/100</ThemedText>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 40 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
