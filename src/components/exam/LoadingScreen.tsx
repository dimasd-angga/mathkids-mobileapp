import React from 'react';
import { SafeAreaView } from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';

type LoadingScreenProps = {
  message: string;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <ThemedText className="text-xl">{message}</ThemedText>
    </SafeAreaView>
  );
};

export default LoadingScreen;
