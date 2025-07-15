import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Button from './CapsuleButton';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && <Button title="Try Again" onPress={onRetry} style={styles.retryButton} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdecea',
    padding: 16,
    borderRadius: 8,
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  text: {
    color: '#b71c1c',
    marginBottom: 10,
    fontSize: 15,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
});

export default ErrorMessage;
