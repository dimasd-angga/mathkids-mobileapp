import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native';
import { RootStackParamList } from '@/navigation/NavigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import MountainSVG from '@/assets/images/mountain-base-login.svg';
import LoginForm from '@/components/auth/LoginForm';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import LoginFailedModal from '@/components/auth/LoginFailedModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SunLogo from '@/components/common/SunLogo';
import TitleWithShadow from '@/components/common/TitleWithShadow';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const { login, clearError, isLoading, error } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  useEffect(() => {
    clearError();
  }, []);

  const handleLogin = async ({ username, password }: { username: string; password: string }) => {
    try {
      await login({ identifier: username, password });
    } catch (error) {
      setShowErrorPopup(true);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          backgroundColor: '#FFFFBE',
        }}
        className="bg-yellow-light"
      >
        <View>
          <SunLogo />

          <View className="h-[270px] w-full z-0 justify-start items-center overflow-visible relative">
            <View
              style={{
                width: 1200,
                position: 'absolute',
                left: '50%',
                transform: [{ translateX: -600 }],
              }}
            >
              <MountainSVG width="100%" />
            </View>
          </View>
        </View>

        <View className="bg-primary -mt-[40px] pb-[40px]">
          <View className="items-center mb-5">
            <TitleWithShadow style={{ fontSize: 48 }}>Welcome!</TitleWithShadow>
          </View>

          <View className="px-8">
            <View className="bg-accent py-3 px-5 rounded-full self-start mb-[-20px] ml-[-10px] z-10">
              <TitleWithShadow
                style={{
                  fontSize: 32,
                  padding: 0,
                  textShadowColor: 'rgba(0, 0, 0, 0.25)',
                  textShadowOffset: { width: 0, height: 5 },
                  textShadowRadius: 10,
                }}
              >
                LOG IN
              </TitleWithShadow>
            </View>

            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            <View className="flex-row bg-accent rounded-full py-1.5 px-5 justify-between items-center mt-5 border-3 border-white self-center">
              <ThemedText className="text-white text-base mr-2.5">
                Don't have an account?
              </ThemedText>
              <TouchableOpacity onPress={handleRegister}>
                <ThemedText className="text-primary text-lg bg-white py-1.5 px-2.5 rounded-lg">
                  REGISTER!
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <LoginFailedModal showModal={showErrorPopup} handleClose={() => setShowErrorPopup(false)} />
    </>
  );
};

export default LoginScreen;
