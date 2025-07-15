import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ProgressComparisonBar from '@/components/exam/ProgressComparisonBar';
import LevelProgressionBar from '@/components/exam/LevelProgressionBar';
import ScoreBadge from '@/components/common/ScoreBadge';
import WellDoneBadge from '@/components/common/WellDoneBadge';
import { ThemedText } from '@/contexts/ThemeProvider';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useAppNavigation } from '@/hooks/navigation';
import { getExamStore } from '@/stores/examStore';
import reportStore from '@/stores/reportStore';
import CapsuleButton from '@/components/common/CapsuleButton';
import { useAuth } from '@/hooks/useAuth';
import { STRAPI_HOST_URL } from '@/constants/apiEndpoints';
import BragFrame from '@/assets/images/brag-frame.svg';
import TitleWithShadow from '@/components/common/TitleWithShadow';
import UserInfoText from '@/components/common/UserInfoText';
import moment from 'moment';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Separate Brag Component for sharing
const BragShareContent = React.forwardRef(
  (
    { score, firstName, isPerfectScore, currentMetrics, userImageUri, examStats, currentLevel },
    ref,
  ) => {
    const animationRef = useRef<LottieView>(null);
    const { user } = useAuth();

    useEffect(() => {
      const timer = setTimeout(() => {
        if (animationRef.current && score > 79) {
          animationRef.current.play();
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [score]);

    return (
      <View
        ref={ref}
        style={styles.bragContainer}
        collapsable={false}
        renderToHardwareTextureAndroid={true}
        shouldRasterizeIOS={true}
      >
        {/* Frame Background */}
        <View style={styles.frameBackground}>
          <BragFrame style={styles.frameImage} />
        </View>

        {/* Content Container - Centered within frame */}
        <View style={styles.bragContent}>
          <View style={styles.bragBadgeContainer}>
            {/* Score Badge with Level */}
            <View style={styles.scoreBadgeWrapper}>
              <ScoreBadge score={score.toString()} />
              {/* Current Level Text */}
              <View style={{ marginTop: -40, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'CooperBlack', fontSize: 12, color: '#111' }}>at</Text>
                <Text style={{ fontFamily: 'CooperBlack', fontSize: 16, color: '#111' }}>
                  {currentLevel}
                </Text>
              </View>
            </View>

            {isPerfectScore && (
              <View style={styles.bragWellDoneOverlay}>
                <WellDoneBadge />
              </View>
            )}
          </View>

          <ThemedText
            style={{
              fontSize: 40,
              paddingBottom: 0,
              paddingHorizontal: 24,
              marginTop: 10,
              color: '#fff',
            }}
          >
            {firstName}
          </ThemedText>
          <View className={'flex flex-row justify-between w-full'}>
            <UserInfoText>B. {moment(user?.birth).format('YYYY')}</UserInfoText>
            <UserInfoText>
              {user?.school?.name || '-'}, {user?.school_grade || '-'}
            </UserInfoText>
          </View>

          <View style={styles.bragFunFactContainer}>
            <ThemedText style={styles.bragFunFactTitle}>Fun Fact</ThemedText>
            <ThemedText style={styles.bragFunFactText}>
              Only 1% made it this far — and you're the only one from Sekolah Lentera Indonesia.
              That's legendary.
            </ThemedText>
          </View>

          {/* Progress Bars */}
          <View style={styles.bragProgressSection}>
            <ProgressComparisonBar
              label="PACE"
              value={currentMetrics.pace}
              showUserImage={true}
              userImageUri={userImageUri}
              color="#FF3378"
              peersValue={examStats?.pace?.average ?? 40}
            />
            <View style={styles.bragBarSpacing} />
            <ProgressComparisonBar
              label="STREAKS"
              value={currentMetrics.streaks}
              showUserImage={true}
              userImageUri={userImageUri}
              color="#FF3378"
              peersValue={examStats?.streaks?.average ?? 80}
            />
            <View style={styles.bragBarSpacing} />
            <ProgressComparisonBar
              label="RESILIENCE"
              value={currentMetrics.resilience}
              showUserImage={true}
              userImageUri={userImageUri}
              color="#FF3378"
              peersValue={examStats?.resilience?.average ?? 30}
            />
          </View>
        </View>
      </View>
    );
  },
);

export default function ExamResultScreen() {
  const navigation = useAppNavigation();
  const examStore = getExamStore();
  const { user } = useAuth();

  const shareableContentRef = useRef(null);
  const animationRef = useRef<LottieView>(null);
  const isMountedRef = useRef(true);
  const [isSharing, setIsSharing] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    pace: 0,
    streaks: 0,
    resilience: 0,
  });
  const [userMetrics, setUserMetrics] = useState({
    pace: 0,
    streaks: 0,
    resilience: 0,
  });

  const {
    userExamResult,
    userStats,
    examStats,
    sessionResult,
    userAverage,
    schoolStats,
    fetchExamResult,
    examResult,
    currentSession,
    fetchDailyExerciseResult,
    isLoadingDailyExerciseResult,
    isLoadingExamResult,
    dailyExerciseResult,
    startExamSession,
    selectedExam,
    setCurrentSession,
  } = examStore();

  const { examGradeMilestones, fetchGradeMilestoneExams, examGradeMilestoneExamsById } =
    reportStore();

  const derivedValues = useMemo(() => {
    const firstName = user?.name?.split(' ')[0] || 'Guest';
    const score = userExamResult?.score ?? sessionResult?.score ?? 0;
    const isPerfectScore = score === 100;

    return { firstName, score, isPerfectScore };
  }, [user, userExamResult, sessionResult]);

  const userImageUri = useMemo(() => {
    const medium = user?.avatar?.formats?.medium;
    if (typeof medium?.url === 'string') {
      return STRAPI_HOST_URL + medium.url;
    }
    if (typeof medium?.uri === 'string') {
      return medium.uri;
    }
    if (typeof user?.avatar?.url === 'string') {
      return STRAPI_HOST_URL + user?.avatar?.url;
    }
    return user?.avatar?.uri || user?.avatar?.url || '';
  }, [user?.avatar]);

  useEffect(() => {
    if (userExamResult?.documentId && isMountedRef.current) {
      if (currentSession?.sessionType === 'daily-exercise') {
        fetchDailyExerciseResult(userExamResult?.documentId);
      } else {
        fetchExamResult(userExamResult?.documentId);
      }
    }
  }, [
    userExamResult?.documentId,
    currentSession?.sessionType,
    fetchDailyExerciseResult,
    fetchExamResult,
  ]);

  useEffect(() => {
    if (isMountedRef.current) {
      fetchGradeMilestoneExams();
    }
  }, [fetchGradeMilestoneExams]);

  useEffect(() => {
    if (userStats && isMountedRef.current) {
      setCurrentMetrics({
        pace: userStats.pace,
        streaks: userStats.streaks,
        resilience: userStats.resilience,
      });
    }
  }, [userStats]);

  useEffect(() => {
    if (userAverage && isMountedRef.current) {
      setUserMetrics({
        pace: userAverage.pace?.average || 0,
        streaks: userAverage.streaks?.average || 0,
        resilience: userAverage.resilience?.average || 0,
      });
    }
  }, [userAverage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationRef.current && derivedValues.score > 79 && isMountedRef.current) {
        animationRef.current.play();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [derivedValues.score]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.reset();
      }
    };
  }, []);

  const getCurrentLevel = useCallback(() => {
    if (!examGradeMilestones || examGradeMilestones.length === 0) {
      return 'Everest 1';
    }

    let currentGrade = null;
    let highestGradeId = -1;

    examGradeMilestones.forEach(grade => {
      const hasOpenedExams = grade.exams.some(exam => exam.status === 'opened');
      if (hasOpenedExams && grade.id > highestGradeId) {
        highestGradeId = grade.id;
        currentGrade = grade;
      }
    });

    if (!currentGrade) {
      return 'Everest 1';
    }

    const openedExamsInGrade = currentGrade.exams
      .filter(exam => exam.status === 'opened')
      .sort((a, b) => b.exam_index - a.exam_index);

    const latestExamIndex = openedExamsInGrade.length > 0 ? openedExamsInGrade[0].exam_index : 1;

    return `${currentGrade.desc} ${latestExamIndex}`;
  }, [examGradeMilestones]);

  const handleShare = useCallback(async () => {
    if (!shareableContentRef.current) {
      Alert.alert('Error', 'Unable to capture content for sharing');
      return;
    }

    // if (isSharing) return;

    setIsSharing(true);

    try {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 500));

      const uri = await captureRef(shareableContentRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
        height: undefined,
        width: undefined,
        snapshotContentContainer: false,
      }).catch(error => {
        console.error('captureRef error:', error);
        throw new Error('Failed to capture screenshot');
      });

      if (!uri) {
        throw new Error('Screenshot capture returned empty URI');
      }

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your amazing score!',
          UTI: 'public.png',
        }).catch(shareError => {
          console.error('Sharing error:', shareError);
          if (mediaStatus === 'granted') {
            return MediaLibrary.saveToLibraryAsync(uri);
          }
          throw shareError;
        });
      } else {
        if (mediaStatus === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Success', 'Image saved to your photo gallery!');
        } else {
          Alert.alert('Permission Required', 'Please grant photo library access to save the image');
        }
      }
    } catch (error) {
      console.error('Error in handleShare:', error);

      const errorMessage = error.message?.includes('capture')
        ? 'Failed to capture screenshot. Please try again.'
        : error.message?.includes('permission')
          ? 'Permission denied. Please check your photo library permissions.'
          : 'Failed to share. Please try again.';

      Alert.alert('Error', errorMessage);
    } finally {
      if (isMountedRef.current) {
        setIsSharing(false);
      }
    }
  }, [isSharing, derivedValues, currentMetrics, userImageUri, examStats]);

  const handleTryAgain = useCallback(async () => {
    if (selectedExam !== null) {
      try {
        const session = await startExamSession(selectedExam.documentId);
        setCurrentSession(session);
        navigation.navigate('Exam');
      } catch (error) {
        console.error('Failed to start exam:', error);
      }
    }
  }, [selectedExam, startExamSession, setCurrentSession, navigation]);

  const handleNavigateToResults = useCallback(() => {
    navigation.navigate('AssesmentDetail', {
      examResult:
        currentSession?.sessionType === 'daily-exercise' ? dailyExerciseResult : examResult,
    });
  }, [navigation, currentSession, dailyExerciseResult, examResult]);

  const handleNavigateHome = useCallback(() => {
    navigation.navigate('BottomTabs', { screen: 'Home' });
  }, [navigation]);

  const currentLevel = useMemo(() => getCurrentLevel(), [getCurrentLevel]);

  // Memoize progress bars to prevent unnecessary re-renders
  const progressBars = useMemo(
    () => (
      <View style={styles.section}>
        <ProgressComparisonBar
          label="PACE"
          value={currentMetrics.pace}
          showUserImage={true}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.pace?.average ?? 40}
        />
        <View style={styles.barSpacing} />
        <ProgressComparisonBar
          label="STREAKS"
          value={currentMetrics.streaks}
          showUserImage={true}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.streaks?.average ?? 80}
        />
        <View style={styles.barSpacing} />
        <ProgressComparisonBar
          label="RESILIENCE"
          value={currentMetrics.resilience}
          showUserImage={true}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.resilience?.average ?? 30}
        />
      </View>
    ),
    [currentMetrics, userImageUri, examStats],
  );

  const secondProgressBars = useMemo(
    () => (
      <View style={styles.section}>
        <ProgressComparisonBar
          label="PACE"
          value={currentMetrics.pace}
          showUserImage={false}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.pace?.average ?? 40}
          averageValue={userAverage?.pace}
          showAverageImage={true}
          averageImageUri={userImageUri}
          showAverageValue={true}
          isInverted={true}
        />
        <View style={styles.barSpacing} />
        <ProgressComparisonBar
          label="STREAKS"
          value={currentMetrics.streaks}
          showUserImage={false}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.streaks?.average ?? 80}
          showAverageImage={true}
          averageImageUri={userImageUri}
          averageValue={userAverage?.streaks}
          showAverageValue={true}
        />
        <View style={styles.barSpacing} />
        <ProgressComparisonBar
          label="RESILIENCE"
          value={currentMetrics.resilience}
          showUserImage={false}
          userImageUri={userImageUri}
          color="#FF3378"
          peersValue={examStats?.resilience?.average ?? 30}
          showAverageImage={true}
          averageImageUri={userImageUri}
          averageValue={userAverage?.resilience}
          showAverageValue={true}
        />
      </View>
    ),
    [currentMetrics, userImageUri, examStats, userAverage],
  );

  if (!sessionResult && !userExamResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading results...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.hiddenBragContainer}>
        <BragShareContent
          ref={shareableContentRef}
          score={derivedValues.score}
          firstName={derivedValues.firstName}
          isPerfectScore={derivedValues.isPerfectScore}
          currentMetrics={currentMetrics}
          userImageUri={userImageUri}
          examStats={examStats}
          currentLevel={currentLevel} // Add this prop
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      >
        <View style={styles.contentContainer}>
          <View style={styles.badgeContainer}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {derivedValues.score > 79 && (
                <LottieView
                  ref={animationRef}
                  loop={false}
                  source={require('@/assets/images/confetti.json')}
                  style={{ width: 400, height: 400, zIndex: 20 }}
                  resizeMode="cover"
                  hardwareAccelerationAndroid={true}
                />
              )}
            </View>
            <ScoreBadge score={derivedValues.score.toString()} />
            {derivedValues.isPerfectScore && (
              <View style={styles.wellDoneOverlay}>
                <WellDoneBadge />
              </View>
            )}
          </View>

          {currentSession?.sessionType === 'exam' && derivedValues.score < 80 && (
            <>
              <ThemedText style={[styles.funFactText, { color: 'white', textAlign: 'center' }]}>
                {`${derivedValues.firstName},
good effort!
Just a bit more practice and you'll be on
your way to the top.
Let's try again, you've got this!`}
              </ThemedText>

              <CapsuleButton text="Try Again" className="mt-5 w-full" onPress={handleTryAgain} />
            </>
          )}

          <CapsuleButton
            backgroundColor="#FFC41D"
            className={`z-50 self-center mt-${currentSession?.sessionType === 'exam' && derivedValues.score < 80 ? '5' : '0'} mb-8 w-full`}
            disabled={
              currentSession?.sessionType === 'daily-exercise'
                ? isLoadingDailyExerciseResult || !dailyExerciseResult
                : isLoadingExamResult || !examResult
            }
            isLoading={
              currentSession?.sessionType === 'daily-exercise'
                ? isLoadingDailyExerciseResult
                : isLoadingExamResult
            }
            onPress={handleNavigateToResults}
            text={
              currentSession?.sessionType === 'daily-exercise'
                ? 'Daily Exercise Results'
                : 'Exam Results'
            }
          />

          <View style={styles.section}>
            <ThemedText style={[styles.motivationText, { color: 'white', textAlign: 'center' }]}>
              Great job, {derivedValues.firstName}! You scored {derivedValues.score}. Keep
              practicing to reach perfection!
            </ThemedText>
          </View>

          <View
            style={[
              styles.funFactContainer,
              { borderColor: 'white', borderTopWidth: 1, borderBottomWidth: 1 },
            ]}
          >
            <ThemedText style={[styles.funFactTitle, { color: 'white' }]}>Fun Fact</ThemedText>
            <ThemedText style={[styles.funFactText, { color: 'white' }]}>
              Only 1% made it this far — and you're the only one from Sekolah Lentera Indonesia.
              That's legendary.
            </ThemedText>
          </View>

          {progressBars}
        </View>

        <ThemedText
          className={'text-center text-white text-[12px] mb-1'}
          style={{ fontFamily: 'Helvetica' }}
        >
          Your progress so far...
        </ThemedText>
        <ThemedText className={'mb-4 text-center text-white text-[18px]'}>
          You have reached {currentLevel}
        </ThemedText>

        <View style={styles.fullWidthSection}>
          <LevelProgressionBar />
        </View>

        <View className="px-2 py-3 mb-10 border-t border-b border-white">
          {schoolStats && schoolStats.length > 0 ? (
            schoolStats.map((school, index) => (
              <Text
                key={index}
                className="text-[12px] mb-[5px] text-white"
                style={{ fontFamily: 'CooperBlack' }}
              >
                <Text>
                  {school.totalUsers} students ({school.grade}) are from{' '}
                </Text>
                <Text className="text-[#F8D448]">{school.name}</Text>
              </Text>
            ))
          ) : (
            <View className="self-center text-center">
              <ThemedText className="text-2xl text-white">Top of the board.</ThemedText>
              <ThemedText className="text-2xl text-white">No rivals in sight.</ThemedText>
            </View>
          )}
        </View>

        {secondProgressBars}

        <View className={'flex flex-row justify-between w-full'}>
          <TouchableOpacity
            className={
              'flex justify-center items-center rounded-full border-2 border-white h-[55px] w-[100px]'
            }
            onPress={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText className={'text-white'}>BRAG!</ThemedText>
            )}
          </TouchableOpacity>
          <CapsuleButton className={'w-[80px]'} onPress={handleNavigateHome}>
            <FontAwesome5 name="chevron-right" size={20} color="#fff" />
          </CapsuleButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#47ADE8',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  // Hidden Brag Container - positioned off-screen but renderable
  hiddenBragContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 2, // Way off screen
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT, // Reduced height to fit frame
    zIndex: -1,
  },
  // Brag Component Styles - Adjusted for better frame fit
  bragContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT, // Reduced from 1.4 to 1.0
    position: 'relative',
    backgroundColor: 'transparent',
  },
  frameBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  frameImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bragContent: {
    position: 'absolute',
    top: '12%', // Adjusted from 15% to 12%
    left: '8%',
    right: '8%',
    bottom: '12%', // Adjusted from 15% to 12%
    zIndex: 2,
    justifyContent: 'flex-start', // Changed from center to flex-start
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confettiContainer: {
    position: 'absolute',
    top: -30, // Reduced from -50
    left: -80, // Reduced from -100
    right: -80, // Reduced from -100
    bottom: -30, // Reduced from -50
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  confettiAnimation: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  bragBadgeContainer: {
    position: 'relative',
    marginBottom: 15, // Reduced from 20
    height: 140, // Reduced from 180
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 120, // Added margin top to move score higher
  },
  bragWellDoneOverlay: {
    position: 'absolute',
    top: -30,
    right: -20,
    left: 0,
  },
  bragFunFactContainer: {
    paddingVertical: 8, // Reduced from 12
    paddingHorizontal: 8,
    marginBottom: 12, // Reduced from 15
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'white',
    width: '100%',
    marginTop: 10,
  },
  bragFunFactTitle: {
    fontSize: 14, // Reduced from 16
    marginBottom: 4, // Reduced from 6
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    color: 'white',
    textAlign: 'center',
  },
  bragFunFactText: {
    fontSize: 11, // Reduced from 12
    lineHeight: 14, // Reduced from 16
    color: 'white',
    textAlign: 'center',
  },
  bragProgressSection: {
    width: '100%',
    flex: 1, // Added to take remaining space
  },
  bragBarSpacing: {
    height: 8, // Reduced from 12
  },
  // Original Component Styles
  funFactContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 40,
  },
  funFactTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
  funFactText: {
    fontSize: 16,
    lineHeight: 22,
  },
  badgeContainer: {
    position: 'relative',
    marginBottom: 16,
    height: 220,
  },
  wellDoneOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  section: {
    marginBottom: 20,
  },
  fullWidthSection: {
    marginBottom: 20,
    marginHorizontal: -16,
  },
  motivationText: {
    fontSize: 16,
    lineHeight: 22,
  },
  barSpacing: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  scoreBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Helvetica',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
