import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  FlatList,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookCard from '@/components/exam/BookCard';
import { ThemedText } from '@/contexts/ThemeProvider';
import MountainGreeting from '@/components/common/MountainGreeting';
import { getExamStore } from '@/stores/examStore';
import { DailyExerciseSession, ExamItem } from '@/types/exams.types';
import CapsuleButton from '@/components/common/CapsuleButton';
import { AppStackParamList } from '@/navigation/NavigationTypes';
import BookExamModal from '@/components/exam/BookExamModal';
import DailyExerciseModal from '@/components/exam/DailyExerciseModal';
import { useAuth } from '@/hooks/useAuth';
import SunLogo from '@/components/common/SunLogo';

type BookSelectionScreenProps = NativeStackScreenProps<AppStackParamList, 'BottomTabs'>;

const ChallengeButton = () => (
  <View className=" absolute justify-center mt-[-25px] z-10 bg-[#FFC41D] border-[5px] border-[#FFDC00] rounded-full items-center px-[20px] h-[40px]">
    <ThemedText
      className="text-xl font-bold text-black"
      style={{
        textShadowColor: '#FFDC00',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 0,
        shadowColor: '#FFDC00',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 0,
        fontSize: 16,
      }}
    >
      DAILY CHALLENGE
    </ThemedText>
    <View className={'absolute z-10 -top-[18px] -right-[0px]'}>
      <Text className={'text-white text-[22px]'}>★</Text>
    </View>
  </View>
);

const ExerciseButton = ({ onPress }: { onPress: () => void }) => (
  <View className={'self-center'}>
    <CapsuleButton className={'w-[300px]'} text={'START DAILY EXERCISE'} onPress={onPress} />
  </View>
);

const EmptyBooksList = () => (
  <View className={'w-[100%] min-h-52 p-5 py-8'}>
    <View
      className={
        'bg-[#F9BF1C] border-[#F8D600] rounded-xl border-[4px] w-[100%] min-h-52 items-center justify-center px-5'
      }
      style={{ backgroundColor: 'rgba(249, 191, 28, 0.5)' }}
    >
      <ThemedText className="my-5 text-2xl text-center text-white">NO EXAM AVAILABLE</ThemedText>
    </View>
  </View>
);

const LoadingIndicator = () => (
  <View className={'w-[100%] min-h-52 p-5 py-8'}>
    <View
      className={
        'bg-[#F9BF1C] border-[#F8D600] rounded-xl border-[4px] w-[100%] min-h-52 items-center justify-center px-5'
      }
      style={{ backgroundColor: 'rgba(249, 191, 28, 0.5)' }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  </View>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <View className={'w-[100%] min-h-52 p-5 py-8'}>
    <View
      className={
        'bg-[#F9BF1C] border-[#F8D600] rounded-xl border-[4px] w-[100%] min-h-52 items-center justify-center px-5'
      }
      style={{ backgroundColor: 'rgba(249, 191, 28, 0.5)' }}
    >
      <ThemedText className="my-5 text-2xl text-center text-white">{message}</ThemedText>
    </View>
  </View>
);

const BookSelectionScreen = ({ navigation }: BookSelectionScreenProps) => {
  const flatListRef = useRef<FlatList<ExamItem>>(null);
  const isFocused = useIsFocused();
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDailyExercise, setSelectedDailyExercise] = useState<number | null>(null);
  const [dailyExerciseData, setDailyExerciseData] = useState<DailyExerciseSession | null>(null);

  const examStore = getExamStore();
  const {
    exams,
    isLoadingExams,
    isLoadingSession,
    error,
    fetchExams,
    startExamSession,
    startDailyExerciseSession,
    selectedExam,
    setSelectedExam,
    setCurrentSession,
    clearSession,
    currentSession,
  } = examStore();

  const { user, checkAuth, isLoading } = useAuth();

  useEffect(() => {
    checkAuth();
    clearSession();
  }, []);

  const { currentLevel, totalLevel } = useMemo(() => {
    if (!user?.grade?.documentId || !exams || exams.length === 0) {
      return { currentLevel: 0, totalLevel: 0 };
    }

    const userGradeExams = exams.filter(
      exam => exam.book?.grade?.documentId === user.grade.documentId,
    );

    if (userGradeExams.length === 0) {
      return { currentLevel: 0, totalLevel: 0 };
    }

    const sortedExams = userGradeExams.sort((a, b) => a.exam_index - b.exam_index);
    const totalLevel = sortedExams.length;
    const openedExams = sortedExams.filter(exam => exam.status === 'opened');

    const currentLevel =
      openedExams.length > 0 ? Math.max(...openedExams.map(exam => exam.exam_index)) : 0;

    return { currentLevel, totalLevel };
  }, [user?.grade?.documentId, exams]);

  useEffect(() => {
    if (user) {
      fetchExams(user?.grade?.id?.toString() || '').catch(error => {
        console.error('Failed to fetch exams:', error);
      });
    }
  }, [fetchExams]);

  const handleExamPress = (exam: ExamItem) => {
    if (exam.status === 'opened') {
      setSelectedExam(exam);
      setShowBookModal(true);
    }
  };

  const handleExercisePress = () => {
    setShowExerciseModal(true);
  };

  const handleStartDailyExercise = () => {
    if (selectedDailyExercise !== null) {
      try {
        setCurrentSession(dailyExerciseData);
        setShowExerciseModal(false);
        navigation.navigate('Exam');
        setSelectedDailyExercise(null);
        setDailyExerciseData(null);
      } catch (error) {
        console.error('Failed to start daily exercise:', error);
      }
    }
  };

  const handleStartExam = async () => {
    if (selectedExam !== null) {
      try {
        const session = await startExamSession(selectedExam.documentId);
        setCurrentSession(session);
        setShowBookModal(false);
        navigation.navigate('Exam');
      } catch (error) {
        console.error('Failed to start exam:', error);
      }
    }
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setTimeout(() => {
      setSelectedExam(null);
    }, 300);
  };

  const closeExerciseModal = () => {
    setShowExerciseModal(false);
    setSelectedDailyExercise(null);
    setDailyExerciseData(null);
  };

  // Fixed function - only handles valid numbers
  const handleSelectExerciseCount = async (count: number) => {
    try {
      console.log('Starting daily exercise with', count, 'questions');
      const session = await startDailyExerciseSession(count);
      setSelectedDailyExercise(count);
      setDailyExerciseData(session);
    } catch (error) {
      console.error('Failed to start daily exercise:', error);
    }
  };

  // New reset function - handles going back to question selection
  const handleResetExerciseSelection = () => {
    setSelectedDailyExercise(null);
    setDailyExerciseData(null);
  };

  const renderExamItem = ({ item }: { item: ExamItem }) => (
    <TouchableOpacity
      className="mx-5 mx-6 my-5 w-44"
      onPress={() => handleExamPress(item)}
      disabled={item.status === 'closed'}
    >
      <BookCard item={item} handleBookPress={() => handleExamPress(item)} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    // Find the last opened exam index
    const lastOpenedExamIndex = useMemo(() => {
      if (!exams || exams.length === 0) return 0;
      // Find the last opened exam by iterating from the end
      for (let i = exams.length - 1; i >= 0; i--) {
        if (exams[i].status === 'opened') return i;
      }
      return 0;
    }, [exams]);

    // Scroll to last opened exam after exams are loaded or screen is focused
    useEffect(() => {
      if (isFocused && exams.length > 0 && flatListRef.current) {
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: lastOpenedExamIndex, animated: true });
          } catch (err) {
            // Index may be out of range or FlatList not ready
          }
        }, 100);
      }
    }, [isFocused, exams, lastOpenedExamIndex]);

    if (isLoadingExams) {
      return <LoadingIndicator />;
    }

    if (error) {
      return <ErrorDisplay message={error} />;
    }

    if (exams.length === 0) {
      return <EmptyBooksList />;
    }

    return (
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ marginHorizontal: 16 }}
        data={exams}
        renderItem={renderExamItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        getItemLayout={
          (data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          }) // 200 is an estimated item width
        }
        initialScrollIndex={lastOpenedExamIndex}
      />
    );
  };

  console.log({ dailyExerciseData });

  return (
    <ScrollView className="flex-1 bg-[#FFFFBE]" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-[#FFFFBE] justify-between ">
        <View className="z-0 justify-start items-center pt-[60px]">
          <SunLogo className="absolute top-0 right-0 left-0" />
          <MountainGreeting />
        </View>
      </View>

      <View className="bg-[#202020] min-h-52 -mt-32 z-0">
        <View className="h-5 w-full bg-[#F2A672]" />
        <View className="flex justify-center items-center">
          <ChallengeButton />
        </View>
        {renderContent()}
        <View className="h-5 w-full bg-[#F2A672]" />
      </View>

      <View className="flex-1 bg-[#66391B] justify-center items-center h-[100px] ">
        <ExerciseButton onPress={handleExercisePress} />
      </View>

      <DailyExerciseModal
        visible={showExerciseModal}
        onClose={closeExerciseModal}
        selectedCount={selectedDailyExercise}
        onSelectCount={handleSelectExerciseCount}
        onStartNow={handleStartDailyExercise}
        dailyExerciseData={dailyExerciseData}
        onResetSelection={handleResetExerciseSelection}
      />

      <BookExamModal
        visible={showBookModal}
        onClose={closeBookModal}
        selectedExam={selectedExam}
        onStartNow={handleStartExam}
        isLoading={isLoadingSession}
      />
    </ScrollView>
  );
};

export default BookSelectionScreen;
