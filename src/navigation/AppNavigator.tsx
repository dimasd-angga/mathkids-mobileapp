import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from '@/navigation/AuthNavigator';
import BottomNavigator from './BottomNavigator';
import { AppStackParamList } from '@/navigation/NavigationTypes';
import { ActivityIndicator, View, Animated, StyleSheet } from 'react-native';
import ExamScreen from '@/screens/books/ExamScreen';
import ExamResultScreen from '@/screens/books/ExamResultScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import AssesmentDetailScreen from '@/screens/report/AssesmentDetailScreen';
import { useAuth } from '@/hooks/useAuth';
import { useAuthInitializer } from '@/hooks/useAuthInitializer';
import ExamHistoryScreen from '@/screens/report/ExamHistory';
import FailedFetchModal from '@/components/common/FailedFetchModal';

const Stack = createStackNavigator<AppStackParamList>();

const MainAppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BottomTabs" component={BottomNavigator} />
      <Stack.Screen name="Exam" component={ExamScreen} options={{
        gestureEnabled: false,
      }}/>
      <Stack.Screen name="ExamResult" component={ExamResultScreen} options={{
        gestureEnabled: false,
      }}/>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AssesmentDetail" component={AssesmentDetailScreen} />
      <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  useAuthInitializer();
  const { isAuthenticated, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [previouslyAuthenticated, setPreviouslyAuthenticated] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setLoading(false);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };
    initAuth();
  }, [checkAuth, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!loading && previouslyAuthenticated !== isAuthenticated) {
      fadeAnim.setValue(0);
      slideAnim.setValue(isAuthenticated ? -30 : 30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setPreviouslyAuthenticated(isAuthenticated);
    }
  }, [isAuthenticated, loading, previouslyAuthenticated, fadeAnim, slideAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {isAuthenticated ? <MainAppNavigator /> : <AuthNavigator />}
      </Animated.View>
      <FailedFetchModal />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default AppNavigator;
