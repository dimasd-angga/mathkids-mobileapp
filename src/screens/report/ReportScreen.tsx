import MountainWijaya from '@/assets/images/mountain-wijaya.svg';
import MountainWijayaTilted from '@/assets/images/mountain-wijaya-tilted.svg';
import MountainAcon from '@/assets/images/mountain-acon.svg';
import MountainAconPattern from '@/assets/images/mountain-acon-pattern.svg';
import MountainAconTilted from '@/assets/images/mountain-acon-tilted.svg';
import MountainDenali from '@/assets/images/mountain-denali.svg';
import MountainDenaliTilted from '@/assets/images/mountain-denali-tilted.svg';
import MountainEverest from '@/assets/images/mountain-everest.svg';
import MountainEverestTilted from '@/assets/images/mountain-everest-tilted.svg';
import MountainWijayaTiltedWide from '@/assets/images/mountain-wijaya-tilted-wide.svg';
import MountainAconTiltedWide from '@/assets/images/mountain-acon-tilted-wide.svg';
import MountainDenaliTiltedWide from '@/assets/images/mountain-denali-tilted-wide.svg';
import MountainEverestTiltedWide from '@/assets/images/mountain-everest-tilted-wide.svg';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import LevelProgressionBar from '@/components/exam/LevelProgressionBar';
import ProgressComparisonBar from '@/components/exam/ProgressComparisonBar';
import CapsuleButton from '@/components/common/CapsuleButton';
import RouteNames from '@/constants/router';
import { ThemedText } from '@/contexts/ThemeProvider';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/utils/constant';
import { useAppNavigation } from '@/hooks/navigation';
import GreetingText from '@/components/common/GreetingText';
import reportStore from '@/stores/reportStore';
import SunLogo from '@/components/common/SunLogo';
import authStore from '@/stores/authStore';
import ImagePickerButton from '@/components/common/ImagePickerButton';
import { STRAPI_HOST_URL } from '@/constants/apiEndpoints';
import Sun from '@/components/common/Sun';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { hexToRgba } from '@/utils/hextorgba';

// Memoized mountain components to prevent unnecessary re-renders
const MountainRenderer = React.memo(({ gradeIndex, isTablet }) => {
  const mountainComponent = useMemo(() => {
    switch (gradeIndex) {
      case '1':
        return isTablet ? <MountainWijayaTiltedWide /> : <MountainWijaya />;
      case '2':
        return isTablet ? <MountainDenaliTiltedWide /> : <MountainDenali />;
      case '3':
        return isTablet ? <MountainAconTiltedWide /> : <MountainAcon />;
      case '4':
        return isTablet ? <MountainEverestTiltedWide /> : <MountainEverest />;
      default:
        return isTablet ? <MountainWijayaTiltedWide /> : <MountainWijaya />;
    }
  }, [gradeIndex, isTablet]);

  return mountainComponent;
});

// Memoized school stats component
const SchoolStats = React.memo(({ schoolStats }) => {
  if (!schoolStats || schoolStats.length === 0) {
    return (
      <View className="items-center self-center w-3/5">
        <ThemedText className={'mt-1 text-white text-[20px]'}>Top of the board.</ThemedText>
        <ThemedText className={'mb-1 text-white text-[20px]'}>No rivals in sight.</ThemedText>
      </View>
    );
  }

  return (
    <>
      {schoolStats.slice(0, 3).map((school, index) => (
        <ThemedText key={`${school.name}-${index}`} className={'text-white text-[12px]'}>
          {school.totalUsers} students ({school.grade}) are from {school.name}
        </ThemedText>
      ))}
    </>
  );
});

// Memoized progress bars component
const ProgressBars = React.memo(({ examData, userImageUri }) => {
  const progressBarsData = useMemo(
    () => [
      {
        label: 'PACE',
        value: examData?.user_stats?.pace?.average || 0,
        peersValue: examData?.exam_stats?.pace?.average || 0,
        averageValue: examData?.overall_stats?.pace?.average || 0,
      },
      {
        label: 'STREAKS',
        value: examData?.user_stats?.streaks?.average || 0,
        peersValue: examData?.exam_stats?.streaks?.average || 0,
        averageValue: examData?.overall_stats?.streaks?.average || 0,
      },
      {
        label: 'RESILIENCE',
        value: examData?.user_stats?.resilience?.average || 0,
        peersValue: examData?.exam_stats?.resilience?.average || 0,
        averageValue: examData?.overall_stats?.resilience?.average || 0,
      },
    ],
    [examData],
  );

  return (
    <View>
      {progressBarsData.map((item, index) => (
        <React.Fragment key={item.label}>
          <ProgressComparisonBar
            label={item.label}
            value={item.value}
            showUserImage={false}
            color="#FF3378"
            peersValue={item.peersValue}
            averageValue={item.averageValue}
            showAverageValue={true}
            showAverageImage={true}
            averageImageUri={userImageUri}
          />
          {index < progressBarsData.length - 1 && <View className={'h-[16px]'} />}
        </React.Fragment>
      ))}
    </View>
  );
});

const ReportScreen = () => {
  const { user, checkAuth, isLoading } = authStore();
  const navigation = useAppNavigation();
  const {
    fetchGradeMilestoneExams,
    fetchGradeMilestoneExamsById,
    isLoadingExamGradeMilestones,
    selectedExamGradeMilestone,
    isLoadingExamGradeMilestonesById,
    examGradeMilestoneExamsById,
  } = reportStore();

  // Memoize tablet detection to prevent recalculation
  const isTablet = useMemo(
    () => (Platform.OS === 'ios' ? Platform.isPad : Dimensions.get('window').width >= 768),
    [],
  );

  // Use useRef for animations to prevent memory leaks
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(100)).current;
  const isFocused = useIsFocused();
  const scrollViewRef = useRef(null);
  const animationRef = useRef(null);

  // Memoize grade index to prevent recalculation
  const gradeIndex = useMemo(() => user?.grade?.index?.toString(), [user?.grade?.index]);

  // Memoize background color calculation
  const backgroundColor = useMemo(() => {
    switch (gradeIndex) {
      case '1': // Wijaya
        return '#007400';
      case '2': // Acon
        return '#FF8E00';
      case '3': // Denali
        return '#4EEAFF';
      case '4': // Everest
        return '#00BCFF';
      default:
        return '#007400'; // Default to Wijaya
    }
  }, [gradeIndex]);

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

  const tilting = useMemo(
    () =>
      rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '30deg'],
      }),
    [rotationAnim],
  );

  const opacityPattern = useMemo(
    () =>
      rotationAnim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [0, 0, 1],
      }),
    [rotationAnim],
  );

  // Optimize animation function with useCallback
  const startAnimation = useCallback(() => {
    // Stop any existing animation to prevent conflicts
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Reset animation values before starting
    rotationAnim.setValue(0);
    translateXAnim.setValue(0);
    translateYAnim.setValue(100);

    // Reset scroll position to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }

    // Start the animations
    animationRef.current = Animated.parallel([
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateXAnim, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]);

    animationRef.current.start();
  }, [rotationAnim, translateXAnim, translateYAnim]);

  // Trigger animation whenever the screen comes into focus
  useEffect(() => {
    if (isFocused) {
      startAnimation();
    }

    // Cleanup function to stop animations when component unmounts or loses focus
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isFocused, startAnimation]);

  // Optimize onRefresh with useCallback
  const onRefresh = useCallback(() => {
    fetchGradeMilestoneExams();
  }, [fetchGradeMilestoneExams]);

  // Optimize navigation handler with useCallback
  const handleExamHistoryPress = useCallback(() => {
    navigation.navigate(RouteNames.ExamHistory, {
      userResult: examGradeMilestoneExamsById?.user_results,
    });
  }, [navigation, examGradeMilestoneExamsById?.user_results]);

  // Optimize image picker handler with useCallback
  const handleImagePicked = useCallback(img => {
    console.log('img', img);
  }, []);

  useEffect(() => {
    onRefresh();
    checkAuth();
  }, [onRefresh, checkAuth]);

  useEffect(() => {
    if (selectedExamGradeMilestone?.documentId) {
      fetchGradeMilestoneExamsById(selectedExamGradeMilestone.documentId);
    }
  }, [selectedExamGradeMilestone?.documentId, fetchGradeMilestoneExamsById]);

  // Memoize button disabled state
  const isButtonDisabled = useMemo(
    () =>
      examGradeMilestoneExamsById?.user_results?.length === 0 || isLoadingExamGradeMilestonesById,
    [examGradeMilestoneExamsById?.user_results?.length, isLoadingExamGradeMilestonesById],
  );

  return (
    <View className="flex h-full bg-[#FFFFBE]">
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      >
        <View className="z-0 justify-start items-center">
          <Sun className="absolute top-0 right-0 left-0" />
          <Animated.View
            style={{
              transform: [
                { rotate: tilting },
                { translateX: translateXAnim },
                { translateY: translateYAnim },
              ],
            }}
          >
            <MountainRenderer gradeIndex={gradeIndex} isTablet={isTablet} />
          </Animated.View>
        </View>

        <View className="items-center flex-1 mt-[-90px]" style={{ backgroundColor }}>
          {gradeIndex === '3' && (
            <Animated.View
              style={{
                opacity: opacityPattern,
                transform: [
                  { rotate: tilting },
                  { translateX: translateXAnim },
                  { translateY: translateYAnim },
                ],
                position: 'absolute',
                top: -115,
                right: 19,
              }}
            >
              <LinearGradient
                colors={[hexToRgba(backgroundColor, 1), hexToRgba(backgroundColor, 0)]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  left: -60,
                  height: 230,
                  width: SCREEN_WIDTH + 60,
                  zIndex: 10,
                }}
              />
              <MountainAconPattern />
            </Animated.View>
          )}

          <View className={'relative mt-[-60px]'}>
            <ImagePickerButton
              isDisabled
              imageUri={userImageUri}
              onImagePicked={handleImagePicked}
              avatarStyle={{
                borderWidth: 4,
                borderColor: 'white',
              }}
            />
          </View>

          <View className={'mb-5'}>
            <GreetingText />
          </View>

          <LevelProgressionBar />

          <View className="px-9 w-full" style={{ minHeight: SCREEN_HEIGHT * 0.5 }}>
            {isLoadingExamGradeMilestonesById ? (
              <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
            ) : (
              <>
                <View className={'py-3 mb-10 border-t border-b border-white y-3'}>
                  <SchoolStats schoolStats={examGradeMilestoneExamsById?.school_stats} />
                </View>
                <ProgressBars examData={examGradeMilestoneExamsById} userImageUri={userImageUri} />
              </>
            )}
          </View>

          <View className="px-9 w-full">
            <CapsuleButton
              disabled={isButtonDisabled}
              backgroundColor="#FFC41D"
              className="self-center mt-5 mb-14 w-full"
              onPress={handleExamHistoryPress}
              text="My Exam History"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReportScreen;
