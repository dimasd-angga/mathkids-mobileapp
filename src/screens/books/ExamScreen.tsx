import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, SafeAreaView, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '@/navigation/NavigationTypes';
import { getExamStore } from '@/stores/examStore';
import { QuestionAnswer } from '@/types/exams.types';

import ExamHeader from '@/components/exam/ExamHeader';
import QuestionSlider from '@/components/exam/QuestionSlider';
import ExamAnswerSection from '@/components/exam/ExamAnswerSection';
import LoadingScreen from '@/components/exam/LoadingScreen';
import QuitExamModal from '@/components/exam/QuitExamModal';
import ConfirmFinishExam from '@/components/exam/ConfirmFinishExam';

type ExamScreenProps = {
  navigation: StackNavigationProp<AppStackParamList, 'Exam'>;
};

const ExamScreen: React.FC<ExamScreenProps> = ({ navigation }) => {
  const examStore = getExamStore();
  const { currentSession, isSubmittingResults, submitResults, clearSession } = examStore();

  const isQuittingRef = useRef(false);
  const hasShownAlertRef = useRef(false);
  const isScreenFocusedRef = useRef(true);

  const [isInitialized, setIsInitialized] = useState(false);

  const isValidSession = useMemo(() => {
    return currentSession?.questions && currentSession.questions.length > 0;
  }, [currentSession]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStartTime] = useState(() => Date.now());
  const [forceRerender, setForceRerender] = useState(0);

  const [questionAnswers, setQuestionAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});

  const [resilienceCount, setResilienceCount] = useState(0);
  const [questionHistory, setQuestionHistory] = useState<
    Record<
      number,
      {
        wasSkipped: boolean;
        wasIncorrect: boolean;
        hasBeenAnsweredCorrectly: boolean;
      }
    >
  >({});

  const [showBackModal, setShowBackModal] = useState(false);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  const questions = currentSession?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const skippedQuestions = useMemo(
    () => Object.values(questionAnswers).filter(a => a.isSkipped),
    [questionAnswers],
  );
  const answeredQuestions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(questionAnswers).map(([index, answer]) => [
          parseInt(index),
          answer.isSkipped ? undefined : answer.isCorrect,
        ]),
      ),
    [questionAnswers],
  );

  const sessionType = currentSession?.sessionType || 'exam';
  const dailyExerciseLevel =
    currentSession?.sessionType === 'daily-exercise'
      ? (currentSession as any).level || 1
      : undefined;

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      return () => {
        isScreenFocusedRef.current = false;
        hasShownAlertRef.current = false;
      };
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (
      !isValidSession &&
      !isQuittingRef.current &&
      !hasShownAlertRef.current &&
      isScreenFocusedRef.current
    ) {
      hasShownAlertRef.current = true;

      console.log('Session validation failed:', {
        currentSession: !!currentSession,
        questions: currentSession?.questions?.length || 0,
      });

      Alert.alert('No Exam Data', 'Could not load exam questions. Please try again.', [
        {
          text: 'OK',
          onPress: () => {
            clearSession();
            navigation.navigate('BottomTabs', { screen: 'Home' });
          },
        },
      ]);
    }
  }, [isInitialized, isValidSession, navigation, clearSession, currentSession]);

  useEffect(() => {
    if (!isValidSession || !currentQuestion) return;

    if (!questionStartTimes[currentQuestionIndex]) {
      setQuestionStartTimes(prev => ({
        ...prev,
        [currentQuestionIndex]: Date.now(),
      }));
    }
  }, [currentQuestionIndex, currentQuestion, isValidSession, questionStartTimes]);

  // Function to update resilience count
  const updateResilienceCount = useCallback(
    (questionIndex: number, isCorrect: boolean) => {
      const history = questionHistory[questionIndex];

      if (
        isCorrect &&
        history &&
        (history.wasSkipped || history.wasIncorrect) &&
        !history.hasBeenAnsweredCorrectly
      ) {
        setResilienceCount(prev => prev + 1);
        setQuestionHistory(prev => ({
          ...prev,
          [questionIndex]: {
            ...prev[questionIndex],
            hasBeenAnsweredCorrectly: true,
          },
        }));
        console.log(
          `Resilience increased! Question ${questionIndex + 1} was previously ${history.wasSkipped ? 'skipped' : 'incorrect'} and now answered correctly. Total resilience: ${resilienceCount + 1}`,
        );
      }
    },
    [questionHistory, resilienceCount],
  );

  // Function to track question history
  const trackQuestionHistory = useCallback(
    (questionIndex: number, isSkipped: boolean, isCorrect: boolean) => {
      setQuestionHistory(prev => {
        const existing = prev[questionIndex] || {
          wasSkipped: false,
          wasIncorrect: false,
          hasBeenAnsweredCorrectly: false,
        };

        return {
          ...prev,
          [questionIndex]: {
            wasSkipped: existing.wasSkipped || isSkipped,
            wasIncorrect: existing.wasIncorrect || (!isSkipped && !isCorrect),
            hasBeenAnsweredCorrectly: existing.hasBeenAnsweredCorrectly || isCorrect,
          },
        };
      });
    },
    [],
  );

  const updateQuestionAnswer = useCallback(
    (questionIndex: number, userAnswer: string, isCorrect: boolean, isSkipped: boolean = false) => {
      if (!currentQuestion) return;

      const startTime = questionStartTimes[questionIndex] || Date.now();
      const timeSpent = (Date.now() - startTime) / 1000;

      // Track question history for resilience calculation
      trackQuestionHistory(questionIndex, isSkipped, isCorrect);

      // Update resilience count if applicable
      if (!isSkipped) {
        updateResilienceCount(questionIndex, isCorrect);
      }

      setQuestionAnswers(prev => {
        const existing = prev[questionIndex];
        const attempts = (existing?.attempts || 0) + (userAnswer.trim() ? 1 : 0);

        return {
          ...prev,
          [questionIndex]: {
            questionId: currentQuestion.documentId,
            question: currentQuestion.question,
            correctAnswer: currentQuestion.answer,
            userAnswer: userAnswer.trim(),
            isCorrect,
            timeSpent: parseFloat(timeSpent.toFixed(1)),
            attempts,
            isSkipped,
            startTime,
          },
        };
      });
    },
    [currentQuestion, questionStartTimes, trackQuestionHistory, updateResilienceCount],
  );

  const checkAnswer = useCallback(
    (answer: string): boolean => {
      if (!currentQuestion || !answer.trim()) return false;

      const isCorrect = answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
      updateQuestionAnswer(currentQuestionIndex, answer, isCorrect);
      return isCorrect;
    },
    [currentQuestion, currentQuestionIndex, updateQuestionAnswer],
  );

  const moveToQuestion = useCallback(
    (targetIndex: number, currentAnswer: string = '') => {
      if (currentAnswer && currentQuestion) {
        const isCorrect =
          currentAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
        updateQuestionAnswer(currentQuestionIndex, currentAnswer, isCorrect);
      }

      setCurrentQuestionIndex(targetIndex);
      // REMOVE: setForceRerender(prev => prev + 1);
    },
    [currentQuestion, currentQuestionIndex, updateQuestionAnswer],
  );

  const handleHeaderBack = useCallback(
    (currentAnswer: string) => {
      if (currentAnswer) {
        moveToQuestion(currentQuestionIndex, currentAnswer);
      }
      setShowBackModal(true);
    },
    [currentQuestionIndex, moveToQuestion],
  );

  const handleAnswerSectionBack = useCallback(
    (currentAnswer: string) => {
      if (currentQuestionIndex > 0) {
        moveToQuestion(currentQuestionIndex - 1, currentAnswer);
      }
    },
    [currentQuestionIndex, moveToQuestion],
  );

  const handleSkip = useCallback(() => {
    if (currentQuestionIndex === totalQuestions - 1) return;

    const existingAnswer = questionAnswers[currentQuestionIndex];
    if (existingAnswer && existingAnswer.userAnswer.trim() && !existingAnswer.isSkipped) {
      return;
    }

    if (currentQuestion) {
      const startTime = questionStartTimes[currentQuestionIndex] || Date.now();
      const timeSpent = (Date.now() - startTime) / 1000;

      // Track that this question was skipped
      trackQuestionHistory(currentQuestionIndex, true, false);

      setQuestionAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          questionId: currentQuestion.documentId,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.answer,
          userAnswer: '',
          isCorrect: false,
          timeSpent: parseFloat(timeSpent.toFixed(1)),
          attempts: 0,
          isSkipped: true,
          startTime,
        },
      }));
    }

    setCurrentQuestionIndex(prev => prev + 1);
    // REMOVE: setForceRerender(prev => prev + 1);
  }, [
    currentQuestionIndex,
    totalQuestions,
    currentQuestion,
    questionStartTimes,
    questionAnswers,
    trackQuestionHistory,
  ]);

  const submitExamWithAnswers = useCallback(
    async (answersToSubmit: Record<number, QuestionAnswer>) => {
      if (!currentSession) return;

      try {
        setIsSubmittingExam(true);

        const finalAnswers = { ...answersToSubmit };
        questions.forEach((question, index) => {
          if (!finalAnswers[index]) {
            const startTime = questionStartTimes[index] || Date.now();
            finalAnswers[index] = {
              questionId: question.documentId,
              question: question.question,
              correctAnswer: question.answer,
              userAnswer: '',
              isCorrect: false,
              timeSpent: 0,
              attempts: 0,
              isSkipped: true,
              startTime,
            };
          }
        });

        const answersArray = Object.values(finalAnswers);
        const totalTime = answersArray.reduce((sum, answer) => sum + answer.timeSpent, 0);

        console.log(`Final resilience count: ${resilienceCount}`);

        const submitParams = {
          sessionId: currentSession.sessionId,
          answers: answersArray,
          totalTime,
          resilience: resilienceCount, // Pass the calculated resilience count
          ...(sessionType === 'daily-exercise' &&
            dailyExerciseLevel && { level: dailyExerciseLevel }),
          ...(sessionType === 'daily-exercise' &&
            dailyExerciseLevel && { questionCount: currentSession.questionCount }),
        };

        await submitResults(submitParams);

        setShowSkippedModal(false);
        setIsSubmittingExam(false);

        if (sessionType === 'daily-exercise') {
          navigation.navigate('ExamResult');
        } else {
          navigation.navigate('ExamResult');
        }
      } catch (error) {
        setIsSubmittingExam(false);
        console.error('Failed to submit results:', error);

        const errorMessage =
          sessionType === 'daily-exercise'
            ? 'Failed to submit your daily exercise results. Please try again.'
            : 'Failed to submit your exam results. Please try again.';

        Alert.alert('Submission Error', errorMessage);
      }
    },
    [
      currentSession,
      questions,
      questionStartTimes,
      submitResults,
      navigation,
      sessionType,
      dailyExerciseLevel,
      resilienceCount, // Add resilience count dependency
    ],
  );

  console.log({ currentSession: currentSession });
  console.log({ resilienceCount: resilienceCount });
  console.log({ questionHistory: questionHistory });

  const handleNext = useCallback(
    async (currentAnswer: string) => {
      if (currentQuestionIndex === totalQuestions - 1) {
        let finalAnswers = { ...questionAnswers };

        if (currentAnswer.trim() && currentQuestion) {
          const startTime = questionStartTimes[currentQuestionIndex] || Date.now();
          const timeSpent = (Date.now() - startTime) / 1000;
          const isCorrect =
            currentAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();

          // Track question history and update resilience for final answer
          trackQuestionHistory(currentQuestionIndex, false, isCorrect);
          if (isCorrect) {
            updateResilienceCount(currentQuestionIndex, isCorrect);
          }

          finalAnswers[currentQuestionIndex] = {
            questionId: currentQuestion.documentId,
            question: currentQuestion.question,
            correctAnswer: currentQuestion.answer,
            userAnswer: currentAnswer.trim(),
            isCorrect,
            timeSpent: parseFloat(timeSpent.toFixed(1)),
            attempts: (finalAnswers[currentQuestionIndex]?.attempts || 0) + 1,
            isSkipped: false,
            startTime,
          };

          setQuestionAnswers(finalAnswers);
        }

        setTimeout(() => {
          const skippedCount = Object.values(finalAnswers).filter(a => a.isSkipped).length;

          if (skippedCount > 0) {
            setShowSkippedModal(true);
          } else {
            submitExamWithAnswers(finalAnswers);
          }
        }, 100);
      } else {
        if (currentAnswer.trim() && currentQuestion) {
          const isCorrect =
            currentAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
          updateQuestionAnswer(currentQuestionIndex, currentAnswer, isCorrect);
        }

        // REMOVE the timeout delay for immediate navigation
        moveToQuestion(currentQuestionIndex + 1);
      }
    },
    [
      currentQuestionIndex,
      totalQuestions,
      currentQuestion,
      questionAnswers,
      questionStartTimes,
      updateQuestionAnswer,
      moveToQuestion,
      submitExamWithAnswers,
      trackQuestionHistory,
      updateResilienceCount,
    ],
  );

  const submitExam = useCallback(async () => {
    await submitExamWithAnswers(questionAnswers);
  }, [questionAnswers, submitExamWithAnswers]);

  const handleQuestionChange = useCallback(
    (index: number, currentAnswer: string) => {
      moveToQuestion(index, currentAnswer);
    },
    [moveToQuestion],
  );

  const handleModalClose = useCallback(() => {
    const firstSkippedIndex = skippedQuestions.findIndex(
      (_, index) => questionAnswers[index]?.isSkipped,
    );

    if (firstSkippedIndex !== -1) {
      moveToQuestion(firstSkippedIndex);
    }

    setTimeout(() => {
      setShowSkippedModal(false);
    }, 150);
  }, [skippedQuestions, questionAnswers, moveToQuestion]);

  const handleQuit = useCallback(() => {
    isQuittingRef.current = true;
    setTimeout(() => {
      setShowBackModal(false);
    }, 200);
    setTimeout(() => {
      clearSession();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'BottomTabs', params: { screen: 'Home' } }],
        }),
      );
    }, 400);
  }, [clearSession, navigation]);

  const isQuestionAnswered = useCallback(() => {
    const answer = questionAnswers[currentQuestionIndex];
    return answer && answer.userAnswer.trim() && !answer.isSkipped;
  }, [questionAnswers, currentQuestionIndex]);

  const getCurrentDisplayAnswer = useCallback(() => {
    return questionAnswers[currentQuestionIndex]?.userAnswer || '';
  }, [questionAnswers, currentQuestionIndex]);

  const getCurrentAnswerStatus = useCallback(() => {
    const answer = questionAnswers[currentQuestionIndex];
    if (!answer || !answer.userAnswer.trim() || answer.isSkipped) return undefined;
    return answer.isCorrect;
  }, [questionAnswers, currentQuestionIndex]);

  const getCurrentSkipStatus = useCallback(() => {
    const answer = questionAnswers[currentQuestionIndex];
    return answer?.isSkipped || false;
  }, [questionAnswers, currentQuestionIndex]);

  if (!isInitialized || (!isValidSession && !isQuittingRef.current)) {
    return <LoadingScreen message="Loading exam..." />;
  }

  if (currentQuestionIndex >= totalQuestions) {
    return <LoadingScreen message="Processing exam..." />;
  }

  if (!currentQuestion) {
    return <LoadingScreen message="Loading question..." />;
  }

  console.log({ currentQuestion: currentQuestion });

  return (
    <View className="flex-1 flex-column bg-white">
      <View className="flex-1 overflow-hidden">
        <View className="h-[5%] bg-[#F2A672]" />

        <ExamHeader
          renderType={currentQuestion.renderType.name.toLowerCase()}
          question={currentQuestion.question}
          startTime={sessionStartTime}
          onBack={() => handleHeaderBack(getCurrentDisplayAnswer())}
          operator={currentQuestion?.operator}
        />

        <QuestionSlider
          totalQuestions={totalQuestions}
          currentQuestionIndex={currentQuestionIndex}
          onQuestionChange={index => handleQuestionChange(index, getCurrentDisplayAnswer())}
          answeredQuestions={answeredQuestions}
          backgroundColor="#ffffff"
          progressColor="#0082FC"
          buttonColor="#fff"
          height={20}
        />

        <View className="h-[3%] bg-[#F2A672]" />

        <ExamAnswerSection
          initialAnswer={getCurrentDisplayAnswer()}
          correctAnswer={currentQuestion.answer}
          isCorrect={getCurrentAnswerStatus()}
          isSkipped={getCurrentSkipStatus()}
          isLastQuestion={currentQuestionIndex === totalQuestions - 1}
          isSubmitting={isSubmittingResults}
          onBack={handleAnswerSectionBack}
          onSkip={handleSkip}
          onNext={handleNext}
          isFirstQuestion={currentQuestionIndex === 0}
          disableSkip={currentQuestionIndex === totalQuestions - 1 || !!isQuestionAnswered()}
          questionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />
      </View>

      <QuitExamModal
        showModal={showBackModal}
        handleClose={() => setTimeout(() => setShowBackModal(false), 300)}
        handleQuit={handleQuit}
      />

      <ConfirmFinishExam
        showModal={showSkippedModal}
        handleClose={handleModalClose}
        handleFinish={submitExam}
        remainingQuestion={skippedQuestions.length}
        isLoading={isSubmittingExam}
      />
    </View>
  );
};

export default ExamScreen;
