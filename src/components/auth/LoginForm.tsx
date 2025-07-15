import React from 'react';
import { View } from 'react-native';
import TextInput from '@/components/common/TextInput';
import CapsuleButton from '@/components/common/CapsuleButton';
import ErrorMessage from '@/components/common/ErrorMessage';
import { validateEmail, validatePassword } from '@/utils/validation';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useForm } from '@/hooks/useForm';

interface LoginFormProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
  error?: string | null;
  isLoading?: boolean;
}

const validationSchema = {
  username: {
    validate: (value: string) => value.trim() !== '',
    message: 'Please enter a valid username/email address',
  },
  password: {
    validate: (value: string) => validatePassword(value),
    message: 'Password must be at least 8 characters',
  },
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, isLoading = false }) => {
  const { data, errors, handleChange, validate } = useForm(
    { username: '', password: '' },
    validationSchema,
  );

  const handleLogin = () => {
    if (validate()) {
      onSubmit({ username: data.username, password: data.password });
    }
  };

  return (
    <View className="p-5 rounded-3xl border-2 border-white border-dashed bg-white/70">
      {error && <ErrorMessage message={error} />}

      <View className="gap-2 mt-7 mb-2">
        <ThemedText className="text-2xl text-center text-secondary">USERNAME/EMAIL</ThemedText>
        <TextInput
          placeholder="Enter your username/email here..."
          value={data.username}
          onChangeText={v => handleChange('username', v)}
          autoCapitalize="none"
          autoCorrect={false}
          icon="account"
          accentColor="#FF3278"
          error={errors.username}
        />
      </View>

      <View className="gap-2 mb-2">
        <ThemedText className="text-[#00BB98] text-center text-2xl">PASSWORD</ThemedText>
        <TextInput
          placeholder="Enter your password here..."
          value={data.password}
          onChangeText={v => handleChange('password', v)}
          secureTextEntry
          autoCapitalize="none"
          icon="lock"
          accentColor="#00BB98"
          error={errors.password}
        />
      </View>

      <View className="self-center">
        <CapsuleButton
          text="START LEARNING!"
          className="w-[210px]"
          isLoading={isLoading}
          onPress={handleLogin}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

export default LoginForm;
