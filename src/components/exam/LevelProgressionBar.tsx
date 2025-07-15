import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import MountainEverest from '@/assets/images/mountain-everest.svg';
import MountainJayaWijaya from '@/assets/images/mountain-jaya-wijaya.svg';
import MountainAcon from '@/assets/images/mountain-acon.svg';
import MountainDenali from '@/assets/images/mountain-denali.svg';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import * as Animatable from 'react-native-animatable';
import reportStore from '@/stores/reportStore';
import { GradeMilestoneItemExam } from '@/types/report.types';

const ShadowComponent = Animatable.createAnimatableComponent(Shadow);

type LevelProgressionBarProps = {
  primaryColor?: string;
  secondaryColor?: string;
  milestoneColor?: string;
  height?: number;
  itemWidth?: number;
};

const LevelProgressionBar = ({
  primaryColor = '#ED1E79',
  secondaryColor = '#0BB0EA',
  milestoneColor = '#E8BA00',
  height = 85,
  itemWidth = 90,
}: LevelProgressionBarProps) => {
  const barHeight = height * 0.2;
  const circleSize = 52;
  const dotSize = 24;
  const largeCircleRadius = height * 0.35;
  const spacing = 20; // Fixed spacing between elements
  const {
    examGradeMilestones,
    isLoadingExamGradeMilestones,
    setSelectedExamGradeMilestone,
    clearSelectedExamGradeMilestone,
    selectedExamGradeMilestone,
  } = reportStore();
  const scrollRef = React.useRef<ScrollView>(null);
  const deviceWidth = Dimensions.get('window').width;
  const [examCenters, setExamCenters] = React.useState<number[]>([]);

  const calculateTotalWidth = () => {
    let width = 30; // Starting padding
    const milestoneWidth = 80; // Milestone circle width

    examGradeMilestones.forEach((grade, gradeIdx) => {
      // Add milestone width
      width += milestoneWidth;

      // Add exams for this grade
      grade.exams.forEach(() => {
        width += spacing + dotSize + spacing + circleSize;
      });

      // Add final spacing after last exam of grade (if not last grade)
      if (gradeIdx < examGradeMilestones.length - 1) {
        width += spacing + dotSize;
      }
    });

    width += 130; // End padding to accommodate last milestone circle (40px radius * 2)
    return width;
  };

  const totalWidth = calculateTotalWidth();

  const renderMilestoneCircle = (key: string, left: number, label?: string, index?: string) => {
    const renderImage = () => {
      switch (index) {
        case '1':
          return <MountainJayaWijaya style={{ marginTop: -8 }} width={130} height={130} />;
        case '2':
          return <MountainDenali style={{ marginTop: -8 }} width={130} height={130} />;
        case '3':
          return <MountainAcon style={{ marginTop: -8 }} width={130} height={130} />;
        default:
          return <MountainEverest style={{ marginTop: -8 }} width={130} height={130} />;
      }
    };
    const circleDiameter = 80;
    const borderWidth = 5;
    return (
      <View
        key={key}
        style={{
          position: 'absolute',
          left: left - circleDiameter / 2, // Center the milestone
          width: circleDiameter,
          height: circleDiameter,
          borderRadius: circleDiameter / 2,
          borderWidth,
          borderColor: 'white',
          backgroundColor: '#E8BA00', // gold/yellow
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {renderImage()}
      </View>
    );
  };

  const renderDot = (key: string, left: number, isActive: boolean) => {
    return (
      <View
        key={key}
        style={[
          styles.blankDot,
          {
            backgroundColor: isActive ? primaryColor : secondaryColor,
            left: left - dotSize / 2, // Center the dot
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
          },
        ]}
      />
    );
  };

  const levelItemsMemo = useMemo(() => {
    const items = [];
    let currentPosition = 30;
    const centers: number[] = [];

    // Get all exams and find the last opened one
    const allExams = examGradeMilestones.flatMap(g => g.exams);
    const lastOpenedExam = [...allExams].reverse().find(exam => exam.status === 'opened') || null;
    let activeLevelIdx = 1;
    if (lastOpenedExam) {
      activeLevelIdx = allExams.findIndex(exam => exam.id === lastOpenedExam.id) + 1;
    }

    let globalExamIndex = 0;

    examGradeMilestones.forEach((grade, gradeIdx) => {
      // Add milestone at the beginning of each grade
      const milestoneCenter = currentPosition + 40; // 40 is half of milestone width (80)
      items.push(
        renderMilestoneCircle(
          `milestone-${gradeIdx + 1}`,
          milestoneCenter,
          grade.title,
          (gradeIdx + 1).toString(),
        ),
      );

      currentPosition += 80; // Move past milestone

      // Process exams in this grade
      grade.exams.forEach((exam, examIdx) => {
        globalExamIndex++;

        // Add dot before level
        currentPosition += spacing;
        const dotCenter = currentPosition + dotSize / 2;
        items.push(
          renderDot(
            `dot-before-g${grade.id}-e${exam.id}`,
            dotCenter,
            globalExamIndex <= activeLevelIdx,
          ),
        );

        currentPosition += dotSize;

        // Add level
        currentPosition += spacing;
        const levelCenter = currentPosition + circleSize / 2;

        const isSelected = selectedExamGradeMilestone && exam.id === selectedExamGradeMilestone.id;
        const isClosed = exam.status === 'closed';

        items.push(
          <TouchableOpacity
            onPress={() => {
              if (!isClosed) setSelectedExamGradeMilestone(exam);
            }}
            key={`level-g${grade.id}-e${exam.id}`}
            style={[
              styles.levelItem,
              {
                left: currentPosition,
                top: largeCircleRadius / 2,
                width: circleSize,
              },
            ]}
            disabled={isClosed}
          >
            <View style={{ padding: 10 }}>
              <Animatable.View
                animation={isSelected ? 'pulse' : ''}
                easing="ease-in-out"
                iterationCount="infinite"
              >
                <Shadow
                  distance={14}
                  startColor={isSelected ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0,0,0,0)'}
                  offset={[0, 5]}
                  containerStyle={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -(largeCircleRadius / 0.78),
                  }}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: circleSize / 1.05,
                      height: circleSize / 1.05,
                      borderRadius: circleSize / 2,
                      position: 'relative',
                      backgroundColor: 'transparent',
                    }}
                  />
                </Shadow>
              </Animatable.View>
            </View>
            <View
              style={[
                styles.smallCircle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  backgroundColor: exam.status === 'closed' ? '#A5A5A5' : primaryColor,
                  borderWidth: 3,
                  borderColor: '#fff',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2,
                },
              ]}
            >
              <ThemedText style={styles.levelText}>{exam.exam_index}</ThemedText>
            </View>
          </TouchableOpacity>,
        );

        // Save the center coordinate for this exam
        centers.push(levelCenter);
        currentPosition += circleSize;
      });

      // Add dot after last exam of grade (if not last grade)
      if (gradeIdx < examGradeMilestones.length - 1) {
        currentPosition += spacing;
        const dotCenter = currentPosition + dotSize / 2;
        items.push(
          renderDot(`dot-after-grade-${gradeIdx}`, dotCenter, globalExamIndex < activeLevelIdx),
        );
        currentPosition += dotSize + spacing;
      }
    });

    return { items, centers };
  }, [
    examGradeMilestones,
    selectedExamGradeMilestone,
    primaryColor,
    secondaryColor,
    circleSize,
    dotSize,
    spacing,
    largeCircleRadius,
  ]);

  // Update examCenters in state after items/centers change
  React.useEffect(() => {
    setExamCenters(levelItemsMemo.centers);
  }, [levelItemsMemo.centers]);

  // Calculate lastOpenedExam and activeLevelIdx in the component scope
  const allExams = examGradeMilestones.flatMap(g => g.exams);
  const lastOpenedExam = [...allExams].reverse().find(exam => exam.status === 'opened') || null;
  let activeLevelIdx = 1;
  if (lastOpenedExam) {
    activeLevelIdx = allExams.findIndex(exam => exam.id === lastOpenedExam.id) + 1;
  }

  // Set selected exam milestone if found
  useEffect(() => {
    if (!selectedExamGradeMilestone && lastOpenedExam) {
      setSelectedExamGradeMilestone(lastOpenedExam);
    }
  }, [lastOpenedExam, selectedExamGradeMilestone]);

  useEffect(() => {
    if (isLoadingExamGradeMilestones) {
      clearSelectedExamGradeMilestone();
    }
  }, [isLoadingExamGradeMilestones]);

  const items = levelItemsMemo.items;

  useEffect(() => {
    if (!selectedExamGradeMilestone || examCenters.length === 0) return;
    // Find the flat index of the selected exam
    const allExams = examGradeMilestones.flatMap(g => g.exams);
    const examIndex = allExams.findIndex(exam => exam.id === selectedExamGradeMilestone.id);
    if (examIndex === -1) return;
    const centerX = examCenters[examIndex];
    if (scrollRef.current && deviceWidth > 0 && centerX !== undefined) {
      scrollRef.current.scrollTo({
        x: Math.max(centerX - deviceWidth / 2, 0),
        animated: true,
      });
    }
  }, [selectedExamGradeMilestone, examCenters, deviceWidth, examGradeMilestones]);

  if (isLoadingExamGradeMilestones)
    return <ActivityIndicator size="large" color="#FFFFFF" marginTop={20} />;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ width: totalWidth, paddingTop: 10 }}
      ref={scrollRef}
      bounces={false}
      overScrollMode="never"
    >
      <View style={[styles.container, { height, width: totalWidth }]}>
        {/* Progress bar (completed) */}
        <View
          style={[
            styles.progressBar,
            {
              height: barHeight,
              width: (() => {
                const allExams = examGradeMilestones.flatMap(g => g.exams);
                let lastOpenedExamIdx = -1;
                allExams.forEach((exam, idx) => {
                  if (exam.status === 'opened') lastOpenedExamIdx = idx;
                });
                if (lastOpenedExamIdx >= 0 && examCenters.length > lastOpenedExamIdx) {
                  return examCenters[lastOpenedExamIdx] + circleSize / 2;
                }
                return 0;
              })(),
            },
          ]}
        />
        {/* Remaining bar (incomplete) */}
        <View
          style={[
            styles.remainingBar,
            {
              height: barHeight,
              left: (() => {
                const allExams = examGradeMilestones.flatMap(g => g.exams);
                let lastOpenedExamIdx = -1;
                allExams.forEach((exam, idx) => {
                  if (exam.status === 'opened') lastOpenedExamIdx = idx;
                });
                if (lastOpenedExamIdx >= 0 && examCenters.length > lastOpenedExamIdx) {
                  return examCenters[lastOpenedExamIdx] + circleSize / 3;
                }
                return 0;
              })(),
              width:
                totalWidth -
                (() => {
                  const allExams = examGradeMilestones.flatMap(g => g.exams);
                  let lastOpenedExamIdx = -1;
                  allExams.forEach((exam, idx) => {
                    if (exam.status === 'opened') lastOpenedExamIdx = idx;
                  });
                  if (lastOpenedExamIdx >= 0 && examCenters.length > lastOpenedExamIdx) {
                    return examCenters[lastOpenedExamIdx] + circleSize / 3;
                  }
                  return 0;
                })(),
            },
          ]}
        />
        {/* Level indicators */}
        <View style={[styles.levelIndicators, { width: totalWidth }]}>{items}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: '40%',
    transform: [{ translateY: -10 }],
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: 'white',
    zIndex: 1,
    backgroundColor: '#EABC00',
  },
  remainingBar: {
    position: 'absolute',
    top: '40%',
    transform: [{ translateY: -10 }],
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderColor: 'white',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  levelIndicators: {
    position: 'absolute',
    height: '100%',
    zIndex: 2,
    marginTop: -10,
  },
  milestoneContainer: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
  },
  levelItem: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankDot: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    borderWidth: 5,
    borderColor: '#fff',
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default LevelProgressionBar;
