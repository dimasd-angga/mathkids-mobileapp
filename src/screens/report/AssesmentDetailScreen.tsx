import AssesmentStatusSVG from '@/assets/images/assesment-status.svg';
import BackFlip from '@/components/common/BackFlip';
import GradeImage from '@/components/common/GradeImage';
import { ThemedText } from '@/contexts/ThemeProvider';
import { toRoman } from '@/hooks/useRoman';
import { AssesmentDetailRouteProp } from '@/navigation/NavigationTypes';
import reportStore from '@/stores/reportStore';
import { SCREEN_WIDTH } from '@/utils/constant';
import { useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import authStore from '@/stores/authStore';
import { QuestionAnswerCollectionData } from '@/types/report.types';
import * as Animatable from 'react-native-animatable';

const statusBarHeight = Constants.statusBarHeight;

export default function AssesmentDetailScreen() {
  const { user } = authStore();
  const { assessment, examResult } = useRoute<AssesmentDetailRouteProp>().params;
  const [dateWidth, setDateWidth] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const {
    examGradeMilestonesAssesment,
    isLoadingExamGradeMilestonesAssesment,
    fetchGradeMilestoneExamsAssesmentById,
    examGradeMilestoneExamsById,
  } = reportStore();

  console.log('assessment.documentId', assessment, examResult);

  useEffect(() => {
    onRefresh();
  }, [assessment]);

  console.log('examGradeMilestonesAssesment', examGradeMilestonesAssesment);
  console.log({ questionssssss: examGradeMilestonesAssesment?.question_collections });

  const onRefresh = () => {
    if (assessment) fetchGradeMilestoneExamsAssesmentById(assessment?.documentId);
  };

  const formatSecondsToTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRenderType = (question: string) => {
    console.log({ question });
    if (Array.isArray(question)) {
      return 'vertical';
    }
    if (typeof question === 'string') {
      try {
        const parsed = JSON.parse(question);
        if (Array.isArray(parsed)) {
          return 'vertical';
        }
      } catch {}
    }
    if (question.includes('\n')) {
      return 'vertical';
    }
    if (
      question.toLowerCase().includes('problem') ||
      question.includes('has') ||
      question.includes('How many') ||
      question.includes('finds') ||
      question.includes('gives') ||
      question.includes('join') ||
      question.length > 50
    ) {
      return 'wordProblem';
    }
    return 'default';
  };

  const renderQuestion = (question: string, userAnswer: string, fontSize = 20) => {
    const renderType = getRenderType(question);
    console.log({ renderType });
    switch (renderType) {
      case 'vertical':
        let splitQuestions: string[] = [];
        let isArray = false;

        try {
          const parsed = JSON.parse(question);
          if (Array.isArray(parsed)) {
            splitQuestions = parsed;
            isArray = true;
          }
        } catch (err) {
          if (question.includes('\n')) {
            splitQuestions = question.split('\n');
          } else if (question.includes(' ')) {
            splitQuestions = question.split(' ');
          } else {
            splitQuestions = [question];
          }
        }
        return (
          <View className={'items-center'} style={{ width: 60 }}>
            <ThemedText
              style={{
                fontSize: fontSize,
                color: 'black',
                fontFamily: 'Helvetica-Bold',
                textAlign: 'center',
              }}
            >
              {splitQuestions[0]}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: fontSize,
                color: 'black',
                fontFamily: 'Helvetica-Bold',
                textAlign: 'center',
              }}
            >
              {isArray ? splitQuestions[1] : splitQuestions[2]}
            </ThemedText>
            <View className={'relative flex-row items-center w-[50px] gap-[5px]'}>
              <View className="w-full h-[2px] bg-black"></View>
              <ThemedText
                style={{
                  fontSize: fontSize,
                  color: 'black',
                  position: 'absolute',
                  right: -20,
                  top: -25,
                  fontFamily: 'Helvetica-Bold',
                }}
              >
                {isArray ? '' : splitQuestions[1]}
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontSize: fontSize,
                color: 'black',
                fontFamily: 'Helvetica-Bold',
                textAlign: 'center',
              }}
            >
              {userAnswer}
            </ThemedText>
          </View>
        );

      case 'wordProblem':
        return (
          <View style={{ maxWidth: SCREEN_WIDTH * 0.7 }}>
            <ThemedText
              style={{
                fontSize: fontSize * 0.8,
                color: 'black',
                lineHeight: fontSize * 0.8 * 1.2,
                fontFamily: 'Helvetica-Bold',
              }}
              className="text-left"
            >
              {question}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: fontSize * 0.8,
                color: 'black',
                marginTop: 5,
                fontWeight: 'bold',
                fontFamily: 'Helvetica-Bold',
              }}
            >
              Answer: {userAnswer}
            </ThemedText>
          </View>
        );

      default:
        return (
          <ThemedText className="text-xl" style={{ fontFamily: 'Helvetica-Bold' }}>
            {question} = {userAnswer}
          </ThemedText>
        );
    }
  };

  const renderQuestionItem = (q: QuestionAnswerCollectionData, index: number) => {
    return (
      <View key={q.question_id} className="flex-row justify-between items-center pb-2 w-full">
        {/* Question Rendering */}
        <View className="flex-1">{renderQuestion(q.question, q.user_answer)}</View>

        {/* Speed and Status Display */}
        <View className="flex-row justify-between items-center">
          <Text
            className={`w-16 text-xl text-right ${
              q.user_speed > q.avgSpeed ? 'text-red-500' : 'text-black'
            }`}
          >
            {q.user_speed ? q.user_speed : '0'}s
          </Text>

          <View
            className={`w-3.5 h-3.5 mx-2 border border-black rounded-full ${
              q.is_correct ? 'bg-[#62FE35]' : 'bg-red-500'
            }`}
          />

          <View className="w-16 text-xl text-left">
            <Text
              className={`w-16 text-xl text-left ${
                q.user_speed > q.avgSpeed ? 'text-red-500' : 'text-black'
              }`}
            >
              {q.avgSpeed ? q.avgSpeed : '0'}s
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#FFFFBE]">
      {headerVisible &&
        ((examResult?.score && examResult?.score > 80) ||
          (!isLoadingExamGradeMilestonesAssesment &&
            examGradeMilestonesAssesment?.score &&
            examGradeMilestonesAssesment?.score > 80)) && (
          <Animatable.View
            animation={{
              from: {
                opacity: 0,
                transform: [{ scale: 1.5 }],
              },
              to: {
                opacity: 1,
                transform: [{ scale: 1 }],
              },
            }}
            duration={300}
            delay={500}
            style={{
              top: statusBarHeight,
            }}
            className="absolute left-4 h-[88px] w-[88px]"
          >
            <AssesmentStatusSVG />
          </Animatable.View>
        )}

      {headerVisible && (
        <View
          onLayout={e => {
            setDateWidth(e.nativeEvent.layout.width);
          }}
          style={{
            position: 'absolute',
            top: statusBarHeight + 30,
            left: SCREEN_WIDTH / 2 - dateWidth / 2,
          }}
          className="z-10 items-center"
        >
          <Text className="text-sm font-extrabold text-black">
            {moment(examResult?.publishedAt || assessment?.publishedAt).format('DD/MM/YYYY')}
          </Text>
          <Text className="text-sm font-medium text-black">
            {moment(examResult?.publishedAt || assessment?.publishedAt).format('HH:mm')}
          </Text>
        </View>
      )}

      <BackFlip />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, marginTop: 130 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
        onScroll={e => {
          const y = e.nativeEvent.contentOffset.y;
          setHeaderVisible(y < 30);
        }}
        scrollEventThrottle={16}
      >
        {isLoadingExamGradeMilestonesAssesment ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <View className="relative z-10 flex-1 mx-4">
            <View className="flex items-center pt-10 pb-12">
              <GradeImage
                data={
                  examResult
                    ? {
                        exam_index: examResult?.exam_index,
                        index: examResult?.grade?.index,
                      }
                    : undefined
                }
              />

              <ThemedText className="text-2xl text-black">
                {examResult?.grade?.desc || examGradeMilestoneExamsById?.grade?.desc}{' '}
                {examResult?.exam_index || examGradeMilestoneExamsById?.exam_index
                  ? // toRoman(examGradeMilestoneExamsById?.exam_index)
                    examResult?.exam_index || examGradeMilestoneExamsById?.exam_index
                  : '-'}
              </ThemedText>
              <ThemedText className="text-[15px] text-black" style={{ fontFamily: 'Helvetica' }}>
                Attempt {examResult?.attempt || assessment?.attempt}
              </ThemedText>

              <View className="flex-row justify-between mt-4 w-3/4">
                <View className="items-center">
                  <ThemedText
                    className="text-[12px] text-black font-bold mb-1"
                    style={{ fontFamily: 'Helvetica-Bold' }}
                  >
                    SCORE
                  </ThemedText>
                  <ThemedText
                    className="text-2xl font-semibold text-black"
                    style={{ fontFamily: 'Helvetica' }}
                  >
                    {examResult?.score || examGradeMilestonesAssesment?.score}/100
                  </ThemedText>
                </View>
                <View className="items-center">
                  <ThemedText
                    className="text-[12px] text-black font-bold mb-1"
                    style={{ fontFamily: 'Helvetica-Bold' }}
                  >
                    TIME
                  </ThemedText>
                  <ThemedText
                    className="text-2xl font-semibold text-black"
                    style={{ fontFamily: 'Helvetica' }}
                  >
                    {examResult?.total_time
                      ? formatSecondsToTime(Number(examResult?.total_time))
                      : examGradeMilestonesAssesment?.total_time
                        ? formatSecondsToTime(Number(examGradeMilestonesAssesment?.total_time))
                        : '00:00'}
                  </ThemedText>
                </View>
              </View>
              <View className={'px-2 py-3 my-5 mb-10 border-t border-b border-black'}>
                <ThemedText
                  className="text-[12px] text-black font-bold mb-1"
                  style={{ fontFamily: 'Helvetica-Bold' }}
                >
                  PARENTAL NOTE
                </ThemedText>
                <ThemedText
                  className={'text-black text-[11px]'}
                  style={{ fontFamily: 'Helvetica' }}
                >
                  Jonathan had shown exceptional grasp to the topics. He demonstrated high accuracy
                  and speed with comparable resilience when facing more complex problems. Well done.
                </ThemedText>
              </View>
              <View className="gap-3 pl-4 space-y-3 w-full">
                <Text
                  className="-mt-6 mb-1 mr-3 font-bold text-black text-[12px] self-end"
                  style={{ fontFamily: 'Helvetica' }}
                >
                  Your Peers
                </Text>
                {examResult && examResult?.question_collections?.length > 0
                  ? examResult?.question_collections?.map((q, index) => {
                      const renderType = getRenderType(q.question);
                      return renderQuestionItem(q, index);
                    })
                  : examGradeMilestonesAssesment?.question_collections?.map((q, index) => {
                      const renderType = getRenderType(q.question);
                      return renderQuestionItem(q, index);
                    })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
