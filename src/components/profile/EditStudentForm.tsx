import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import TextInput from '../common/TextInput';
import Button from '../common/CapsuleButton';
import ErrorMessage from '../common/ErrorMessage';
import { validateEmail, validatePassword } from '@/utils/validation';
import { ThemedText } from '@/contexts/ThemeProvider';
import TextStroke from '@/components/common/OutlinedText';
import { getGradeStore } from '@/stores/gradeStore';
import { useForm } from '@/hooks/useForm';
import DropdownInput from '../common/DropdownInput';
import CapsuleButton from '../common/CapsuleButton';

const validationSchema = {
  firstName: {
    validate: (v: string) => v.trim() !== '',
    message: 'First name is required',
  },
  grade: {
    validate: (v: string) => Boolean(v) && v !== 'none',
    message: 'Please select your grade',
  },
  school: {
    validate: (v: string) => v.trim() !== '',
    message: 'School name is required',
  },
  email: {
    validate: (v: string) => validateEmail(v),
    message: 'Please enter a valid email address',
  },
  username: {
    validate: (v: string) => v.trim() !== '',
    message: 'Username is required',
  },
  password: {
    validate: (v: string) => validatePassword(v),
    message: 'Password must be at least 8 characters',
  },
  confirmPassword: {
    validate: (v: string, allData: any) => v === allData.password && v.trim() !== '',
    message: 'Passwords do not match',
  },
};

const RegisterForm: React.FC = () => {
  const {
      data: formData,
      errors: formErrors,
      handleChange,
      validate,
    } = useForm(
      {
        firstName: '',
        grade: '',
        school: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      },
      validationSchema,
    );
    const [isLoading, setIsLoading] = useState(false);
  
    const gradeStore = getGradeStore();
    const grades = gradeStore(state => state.grades);
    const gradesLoading = gradeStore(state => state.isLoading);
    const gradesError = gradeStore(state => state.error);
  
    useEffect(() => {
      gradeStore
        .getState()
        .fetchGrades()
        .catch(() => {});
    }, []);
  
    const gradeOptions = grades
      .sort((a, b) => {
        const gradeA = parseInt(a.title.replace(/\D/g, ''), 10);
        const gradeB = parseInt(b.title.replace(/\D/g, ''), 10);
        return gradeA - gradeB;
      })
      .map(grade => ({
        label: grade.title,
        value: grade.documentId,
        description: grade.desc || undefined,
      }));
  
    console.log({ gradeOptions });
  
    const handleRegister = () => {
      if (validate()) {
        const { confirmPassword, ...submitData } = formData;
      } else {
        console.log('Form validation failed:', formErrors);
      }
    };

  return (
    <View className="px-5 rounded-3xl">
      <View className="gap-2 mt-5">
        <ThemedText className="text-[#0082FC] text-center text-2xl">FIRST NAME</ThemedText>
        <TextInput
          placeholder="Enter your first name..."
          value={formData.firstName}
          onChangeText={v => handleChange('firstName', v)}
          autoCapitalize="none"
          icon="account"
          accentColor="#0082FC"
          error={formErrors.firstName}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#BB00A2] text-center text-2xl">GRADE</ThemedText>
        <DropdownInput
          icon="book"
          accentColor="#BB00A2"
          placeholder={gradesLoading ? 'Loading grades...' : 'Select your grade...'}
          options={
            gradeOptions.length > 0
              ? gradeOptions
              : [{ label: 'No grades available', value: 'none' }]
          }
          value={formData.grade}
          onValueChange={v => handleChange('grade', v)}
          error={formErrors.grade || (gradesError ? 'Failed to load grades' : '')}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FF6347] text-center text-2xl">SCHOOL</ThemedText>
        <TextInput
          placeholder="Enter your school"
          value={formData.school}
          onChangeText={v => handleChange('school', v)}
          autoCapitalize="none"
          icon="school"
          accentColor="#FF6347"
          error={formErrors.school}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FE3278] text-center text-2xl">EMAIL</ThemedText>
        <TextInput
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={v => handleChange('email', v)}
          autoCapitalize="none"
          icon="email"
          accentColor="#FE3278"
          error={formErrors.email}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FE3278] text-center text-2xl">USERNAME</ThemedText>
        <TextInput
          placeholder="Enter your username"
          value={formData.username}
          onChangeText={v => handleChange('username', v)}
          autoCapitalize="none"
          icon="account"
          accentColor="#FE3278"
          error={formErrors.username}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-2xl text-center text-green">PASSWORD</ThemedText>
        <TextInput
          placeholder="Enter your password..."
          value={formData.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry
          autoCapitalize="none"
          icon="lock"
          accentColor="#00BB98"
          error={formErrors.password}
        />
      </View>

      <View className="gap-2 mb-1">
        <ThemedText className="text-2xl text-center text-green">CONFIRM PASSWORD</ThemedText>
        <TextInput
          placeholder="Confirm your password..."
          value={formData.confirmPassword}
          onChangeText={v => handleChange('confirmPassword', v)}
          secureTextEntry
          autoCapitalize="none"
          icon="lock"
          accentColor="#00BB98"
          error={formErrors.confirmPassword}
        />
      </View>
      
      <View className="self-center mt-4">
        <CapsuleButton
          text="SAVE"
          onPress={handleRegister}
          className="w-[200px]"
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default RegisterForm;
