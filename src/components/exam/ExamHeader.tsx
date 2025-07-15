import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import CircleTimer from '@/components/exam/CircleTimer';

type ExamHeaderProps = {
  question: string;
  renderType: string;
  startTime: number;
  onBack: () => void;
  operator: string;
};

const ExamHeader: React.FC<ExamHeaderProps> = ({
  question,
  startTime,
  onBack,
  renderType,
  operator,
}) => {
  // Memoize fontSize calculation to prevent recalculation on every render
  const fontSize = useMemo(() => {
    return question.length > 20 ? 12 + Math.floor((100 / question.length) * 20) : 56;
  }, [question.length]);

  // Memoize question parsing to prevent re-parsing on every render
  const parsedQuestion = useMemo(() => {
    if (renderType !== 'vertical') {
      return { type: 'standard', content: question };
    }

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

    return {
      type: 'vertical',
      splitQuestions,
      isArray,
      operator: isArray ? (operator ?? '') : splitQuestions[1],
    };
  }, [question, renderType, operator]);

  // Memoize the question render component
  const QuestionComponent = useMemo(() => {
    if (parsedQuestion.type === 'vertical' && 'splitQuestions' in parsedQuestion) {
      const { splitQuestions, isArray, operator: questionOperator } = parsedQuestion;

      return (
        <View className={'items-center'}>
          <ThemedText style={{ fontSize: fontSize, color: 'white' }}>
            {splitQuestions[0]}
          </ThemedText>
          <ThemedText style={{ fontSize: fontSize, color: 'white' }}>
            {isArray ? splitQuestions[1] : splitQuestions[2]}
          </ThemedText>
          <View className={'flex-row w-[100px] items-center gap-[5px] relative'}>
            <View className="w-full h-[5px] bg-white"></View>
            <ThemedText
              style={{
                fontSize: fontSize,
                color: 'white',
                position: 'absolute',
                right: -40,
                top: -50,
              }}
            >
              {questionOperator}
            </ThemedText>
          </View>
        </View>
      );
    }

    return (
      <ThemedText className={`text-white font-bold text-center`} style={{ fontSize }}>
        {question}
      </ThemedText>
    );
  }, [parsedQuestion, fontSize, question]);

  return (
    <View className="h-[45%] bg-[#154F23] relative">
      <View className="flex-row justify-between items-center px-4 pt-8">
        {/* Use a stable key for CircleTimer to prevent re-mounting */}
        <CircleTimer
          key="exam-timer"
          startTime={startTime}
          size={48}
          strokeColor="#FF3278"
          backgroundColor="#000000"
        />

        <TouchableOpacity className="p-2" onPress={onBack}>
          <ThemedText className="text-white font-bold text-2xl">{'< BACK'}</ThemedText>
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center p-4">{QuestionComponent}</View>
    </View>
  );
};

export default React.memo(ExamHeader);
