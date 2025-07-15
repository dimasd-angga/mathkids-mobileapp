import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { RootStackParamList } from '@/navigation/NavigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import RegisterForm from '@/components/auth/RegisterForm';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/types/auth.types';
import RegisterSuccessModal from '@/components/auth/RegisterSuccessModal';
import LoginFailedModal from '@/components/auth/LoginFailedModal';
import RegisterFailedModal from '@/components/auth/RegisterFailedModal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import SunLogo from '@/components/common/SunLogo';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const { register, login, isLoading, error, clearError } = useAuth();
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [errorLoginPopupVisible, setErrorLoginPopupVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setRegistrationError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRegister = async ({
    firstName,
    grade,
    school,
    email,
    username,
    password,
    birth,
  }: {
    firstName: string;
    grade: string;
    school: string;
    email: string;
    username: string;
    password: string;
    birth: string;
  }) => {
    try {
      setRegistrationError(null);

      const userData: RegisterData = {
        username,
        email,
        password,
        grade,
        firstName,
        school,
        birth: moment(birth).format("MM/DD/YYYY"),
      };

      await register(userData);
      setSuccessPopupVisible(true);
      setLoginCreds({ username, password });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';

      setRegistrationError(errorMessage);
      // console.error('Registration error:', errorMessage);
    }
  };

  const handleSuccessClose = async () => {
    try {
      await login({ identifier: loginCreds.username, password: loginCreds.password });
      setLoginCreds({ username: '', password: '' });
      setSuccessPopupVisible(false);
    } catch (error) {
      setErrorLoginPopupVisible(true);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ backgroundColor: '#FFFFBE' }} className="bg-yellow-light">
          <SunLogo />

          <View className="bg-[#01B3FF] pt-4 rounded-t-[90px] rounded-b-none">
            <View className="items-center self-center px-5 py-3 mb-5 rounded-full bg-secondary">
              <ThemedText className="text-5xl text-white shadow">Register</ThemedText>
            </View>
            <View className="flex-row justify-between items-center self-center px-5 py-1 mt-3 mb-5 rounded-full border-white bg-secondary border-3">
              <ThemedText className="text-white text-base mr-2.5">
                Already have an account?
              </ThemedText>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ThemedText className="text-primary text-lg bg-white px-2.5 rounded-lg">
                  LOG IN!
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View className="px-5 pb-20">
              <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
            </View>
          </View>
      </KeyboardAwareScrollView>

      <RegisterSuccessModal
        showModal={successPopupVisible}
        handleClose={handleSuccessClose}
        isLoading={false}
      />
      <LoginFailedModal
        showModal={errorLoginPopupVisible}
        handleClose={() => {
          setErrorLoginPopupVisible(false);
          navigation.navigate('Login');
        }}
      />
      <RegisterFailedModal
        showModal={!!registrationError}
        errorMessage={registrationError}
        handleClose={() => setRegistrationError(null)}
      />
    </>
  );
};

export default RegisterScreen;
