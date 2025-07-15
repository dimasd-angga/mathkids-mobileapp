import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ThemedText } from '@/contexts/ThemeProvider';
import TextInput from '@/components/common/TextInput';
import DropdownInput from '@/components/common/DropdownInput';
import { getGradeStore } from '@/stores/gradeStore';
import { useForm } from '@/hooks/useForm';
import { validateEmail, validatePassword } from '@/utils/validation';
import CapsuleButton from './CapsuleButton';
import OutlinedText from './OutlinedText';
import { SchoolItem } from '@/types/school.types';
import { getSchoolStore } from '@/stores/schoolStore';
import { useAuth } from '@/hooks/useAuth';
import DatePickerInput from './DatePickerInput';
import moment from 'moment';

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
  birth: {
    validate: (v: string) => v.trim() !== '',
    message: 'Birth date is required',
  },
  email: {
    validate: (v: string) => validateEmail(v),
    message: 'Please enter a valid email address',
  },
  username: {
    validate: (v: string) => /^[a-z0-9_]+$/.test(v.trim()),
    message:
      'Username must be lowercase and can only include letters, numbers, and underscores (no spaces or dashes)',
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

const FormUser = ({
  error,
  type = 'register',
  onSubmit,
  isLoading = false,
}: {
  error?: string;
  type?: 'register' | 'profile';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}) => {
  const { user } = useAuth();
  const {
    data: formData,
    errors: formErrors,
    handleChange,
    validate,
  } = useForm<{
    firstName: string;
    grade: string;
    school: string;
    birth: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }>(
    {
      firstName: '',
      grade: '',
      school: '',
      birth: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
  );
  const gradeStore = getGradeStore();
  const grades = gradeStore(state => state.grades);
  const gradesLoading = gradeStore(state => state.isLoading);
  const gradesError = gradeStore(state => state.error);
  const schoolStore = getSchoolStore();
  const schools = schoolStore(state => state.schools);
  const schoolsLoading = schoolStore(state => state.isLoading);
  const schoolsError = schoolStore(state => state.error);

  useEffect(() => {
    gradeStore
      .getState()
      .fetchGrades()
      .catch(() => {});

    schoolStore
      .getState()
      .fetchSchools()
      .catch(() => {});
  }, []);

  function toIsoDate(dateStr: string): string {
    return new Date(dateStr).toISOString();
  }

  useEffect(() => {
    if (type === 'profile') {
      handleChange('firstName', user?.name || user?.firstName || '');
      handleChange('grade', findGradeIdBySchoolGrade(user?.school_grade!) || '');
      handleChange('school', user?.school?.id?.toString() || '');
      handleChange('email', user?.email || '');
      handleChange('username', user?.username || '');
      handleChange('birth', user?.birth ? toIsoDate(user?.birth) : '');
      handleChange('password', '');
      handleChange('confirmPassword', '');
    }
  }, [type]);

  const gradeOptions = grades
    .sort((a, b) => {
      const gradeA = parseInt(a.title.replace(/\D/g, ''), 10);
      const gradeB = parseInt(b.title.replace(/\D/g, ''), 10);
      return gradeA - gradeB;
    })
    .map(grade => ({
      label: grade.title,
      value: grade.id.toString(),
      description: grade.desc || undefined,
    }));
  function findGradeIdBySchoolGrade(schoolGrade: string): string {
    const grade = gradeOptions.find((grade: any) => grade.label === schoolGrade);
    return grade?.value || '';
  }
  const schoolOptions = schools.map((school: SchoolItem) => ({
    label: school.name,
    value: school.id.toString(),
  }));

  console.log('formData', gradeOptions, user);

  return (
    <>
      {error && <ErrorMessage message={error} />}

      <View className="gap-2 mt-5">
        <ThemedText className="text-[#0082FC] text-center text-2xl">YOUR STUDENT'S NAME</ThemedText>
        <TextInput
          placeholder="Your name (max 60 char, alphabet only)"
          value={formData.firstName}
          onChangeText={v => handleChange('firstName', v)}
          autoCapitalize="none"
          icon="account"
          accentColor="#0082FC"
          error={formErrors.firstName}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#BB00A2] text-center text-2xl">STUDENT'S GRADE</ThemedText>
        <DropdownInput
          icon="book"
          showAddButton={false}
          accentColor="#BB00A2"
          placeholder={gradesLoading ? 'Loading grades...' : 'Select grade (Primary 1-6)'}
          options={
            gradeOptions.length > 0
              ? gradeOptions
              : [{ label: 'No grades available', value: 'none' }]
          }
          optionKey={type === 'register' ? 'value' : 'label'}
          value={formData.grade}
          onValueChange={v => handleChange('grade', v)}
          error={formErrors.grade || (gradesError ? 'Failed to load grades' : '')}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FF6347] text-center text-2xl">SCHOOL</ThemedText>
        <DropdownInput
          icon="school"
          accentColor="#FF6347"
          placeholder={schoolsLoading ? 'Loading schools...' : 'Enter school name..'}
          options={
            schoolOptions.length > 0
              ? schoolOptions
              : [{ label: 'No schools available', value: 'none' }]
          }
          value={formData.school}
          onValueChange={v => handleChange('school', v)}
          error={formErrors.school || (schoolsError ? 'Failed to load schools' : '')}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FE3278] text-center text-2xl">STUDENT'S EMAIL</ThemedText>
        <TextInput
          placeholder="Enter school email (e.g. jonathan@acs.edu)"
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
          onChangeText={v => {
            const sanitized = v.toLowerCase().replace(/[^a-z0-9_]/g, '');
            handleChange('username', sanitized);
          }}
          autoCapitalize="none"
          icon="account"
          accentColor="#FE3278"
          error={formErrors.username}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-[#FE3278] text-center text-2xl">DATE OF BIRTH</ThemedText>
        <DatePickerInput
          placeholder="DD/Month/YYYY"
          value={formData.birth}
          onChange={v => handleChange('birth', v)}
          accentColor="#FE3278"
          error={formErrors.birth}
          maximumDate={new Date()}
          minimumDate={new Date(2000, 0, 1)}
        />
      </View>

      <View className="gap-2">
        <ThemedText className="text-2xl text-center text-green">PASSWORD</ThemedText>
        <TextInput
          placeholder="Min. 8 chars, mix letters & numbers"
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
          placeholder="Re-enter password"
          value={formData.confirmPassword}
          onChangeText={v => handleChange('confirmPassword', v)}
          secureTextEntry
          autoCapitalize="none"
          icon="lock"
          accentColor="#00BB98"
          error={formErrors.confirmPassword}
        />
      </View>

      {type === 'register' && (
        <View className="flex mb-8">
          <OutlinedText
            text="By joining, you accept our Terms"
            fontFamily={'CooperBlack'}
            fontSize={20}
            strokeColor="#0082FC"
            strokeWidth={2}
            textColor="#FFFFFF"
          />
        </View>
      )}

      <View className="self-center mt-4">
        <CapsuleButton
          text={type === 'register' ? 'REGISTER' : 'SAVE'}
          onPress={() => onSubmit(formData)}
          className="w-[200px]"
          isLoading={isLoading}
          disabled={
            type === 'register' ? isLoading || Object.values(formErrors).some(Boolean) : isLoading
          }
        />
      </View>
    </>
  );
};

export default FormUser;
