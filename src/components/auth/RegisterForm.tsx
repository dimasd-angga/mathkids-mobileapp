import React from 'react';
import { View } from 'react-native';
import FormUser from '../common/FormUser';

interface RegisterFormProps {
  onSubmit: (data: {
    firstName: string;
    grade: string;
    school: string;
    email: string;
    username: string;
    password: string;
    birth: string;
  }) => void;
  error?: string;
  isLoading?: boolean;
}


const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error, isLoading = false }) => {

  return (
    <View className="p-5 rounded-3xl border-2 border-white border-dashed bg-white/70">
      <FormUser
        error={error}
        type="register"
        onSubmit={(formData) => onSubmit(formData)}
        isLoading={isLoading}
      />
    </View>
  );
};

export default RegisterForm;
