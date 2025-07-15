import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText, useTheme } from '@/contexts/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

interface DropdownOption {
  label: string;
  value: string;
  [key: string]: any;
}

interface DropdownProps {
  label?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  labelClassName?: string;
  accentColor?: string;
  error?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  showAddButton?: boolean;
  optionKey?: string;
}

const ErrorIcon = () => (
  <Svg width="17" height="16" viewBox="0 0 17 16" fill="none">
    <Path
      d="M13.5063 3.90016L9.54629 1.6135C8.89962 1.24016 8.09962 1.24016 7.44629 1.6135L3.49296 3.90016C2.84629 4.2735 2.44629 4.96683 2.44629 5.72016V10.2802C2.44629 11.0268 2.84629 11.7202 3.49296 12.1002L7.45296 14.3868C8.09962 14.7602 8.89962 14.7602 9.55296 14.3868L13.513 12.1002C14.1596 11.7268 14.5596 11.0335 14.5596 10.2802V5.72016C14.553 4.96683 14.153 4.28016 13.5063 3.90016ZM7.99962 5.16683C7.99962 4.8935 8.22629 4.66683 8.49962 4.66683C8.77296 4.66683 8.99962 4.8935 8.99962 5.16683V8.66683C8.99962 8.94016 8.77296 9.16683 8.49962 9.16683C8.22629 9.16683 7.99962 8.94016 7.99962 8.66683V5.16683ZM9.11296 11.0868C9.07962 11.1668 9.03296 11.2402 8.97296 11.3068C8.84629 11.4335 8.67962 11.5002 8.49962 11.5002C8.41296 11.5002 8.32629 11.4802 8.24629 11.4468C8.15962 11.4135 8.09296 11.3668 8.02629 11.3068C7.96629 11.2402 7.91962 11.1668 7.87962 11.0868C7.84629 11.0068 7.83296 10.9202 7.83296 10.8335C7.83296 10.6602 7.89962 10.4868 8.02629 10.3602C8.09296 10.3002 8.15962 10.2535 8.24629 10.2202C8.49296 10.1135 8.78629 10.1735 8.97296 10.3602C9.03296 10.4268 9.07962 10.4935 9.11296 10.5802C9.14629 10.6602 9.16629 10.7468 9.16629 10.8335C9.16629 10.9202 9.14629 11.0068 9.11296 11.0868Z"
      fill="#EF4444"
    />
  </Svg>
);

const Dropdown: React.FC<DropdownProps> = ({
  label,
  labelClassName,
  icon,
  accentColor,
  error,
  placeholder = 'Select an option',
  options,
  value,
  onValueChange,
  className = '',
  showAddButton = true,
  optionKey = 'value',
}) => {
  const theme = useTheme();
  const fallbackColor = theme.colors.primary;
  const finalAccentColor = accentColor || fallbackColor;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const selectedOption = options.find(option => option.value === value);

  // Check if the inputValue is a new value
  const trimmedInput = inputValue.trim();
  const exists = options.some(option => option.label.toLowerCase() === trimmedInput.toLowerCase());
  // Filter options based on inputValue (case-insensitive, substring match)
  const filteredOptions =
    inputValue.length === 0
      ? options
      : options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));

  // The text to display in the input field
  const inputDisplay = selectedOption
    ? selectedOption.label
    : value && value.length > 0
      ? value
      : '';

  // Calculate dropdown height based on filtered options and Add button
  const rowHeight = 48;
  const maxDropdownHeight = 220;
  const numRows = filteredOptions.length + (trimmedInput.length > 0 && !exists ? 1 : 0);
  const calculatedHeight = Math.min(numRows * rowHeight, maxDropdownHeight);

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: isOpen ? calculatedHeight : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen, filteredOptions.length, trimmedInput, exists]);

  const handleOutsidePress = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <View className="mb-4 w-full">
      {label && (
        <ThemedText
          style={{ color: finalAccentColor, fontSize: 11 }}
          className={`mb-2 text-center ${labelClassName}`}
        >
          {label}
        </ThemedText>
      )}
      <View className={`relative w-full ${className}`}>
        <View
          className="flex-row items-center rounded-lg border-3 bg-white/80"
          style={{ borderColor: finalAccentColor }}
        >
          <TextInput
            ref={inputRef}
            value={inputDisplay}
            onChangeText={text => {
              setInputValue(text);
              const option = options.find(option => option.label === text);
              if (option) {
                onValueChange(optionKey ? option[optionKey] : option.value || text);
              } else {
                onValueChange(text);
              }
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontFamily: 'Helvetica',
              color: '#333',
              fontSize: 12,
              backgroundColor: 'transparent',
            }}
            placeholderTextColor="#999999"
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            returnKeyType="done"
            // Always open dropdown on focus
          />
          {isOpen && (
            <TouchableOpacity
              onPress={() => {
                setInputValue('');
                onValueChange('');
              }}
              className="pr-[5px]"
            >
              <MaterialCommunityIcons name="close-circle" size={16} color={finalAccentColor} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsOpen(!isOpen)} className="pr-[45px]">
            <MaterialCommunityIcons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={finalAccentColor}
            />
          </TouchableOpacity>
          {icon && (
            <View
              className="absolute top-0 right-0 w-[37px] h-[25px] rounded-bl-lg justify-center items-center z-10"
              style={{ backgroundColor: finalAccentColor }}
            >
              <MaterialCommunityIcons name={icon} size={15} color="#fff" />
            </View>
          )}
        </View>

        {error && (
          <View className="flex-row items-center mt-1">
            <ErrorIcon />
            <ThemedText className="ml-1 text-xs text-red-500">{error}</ThemedText>
          </View>
        )}

        <Animated.View
          style={{
            height: dropdownHeight,
            overflow: 'hidden',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
            borderTopWidth: 0,
            borderRadius: 8,
            marginTop: 5,
            backgroundColor: 'white',
          }}
        >
          <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="always">
            {trimmedInput.length > 0 && !exists && showAddButton && (
              <TouchableOpacity
                className="mt-2 px-2 py-1 rounded bg-[#E0F7FA] mx-4"
                onPress={() => {
                  onValueChange(trimmedInput);
                  setIsOpen(false);
                  setInputValue(''); // Clear input to hide the Add button
                }}
              >
                <ThemedText style={{ color: finalAccentColor }}>Add "{trimmedInput}"</ThemedText>
              </TouchableOpacity>
            )}
            {filteredOptions.length === 0 && (
              <TouchableOpacity disabled className="mt-2 px-2 py-1 rounded bg-[#E0F7FA] mx-4">
                <ThemedText style={{ color: finalAccentColor }}>No results found</ThemedText>
              </TouchableOpacity>
            )}
            {filteredOptions.map(item => (
              <TouchableOpacity
                key={item.value}
                className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100"
                onPress={() => {
                  onValueChange(item.value);
                  setInputValue(item.label);
                  setIsOpen(false);
                }}
              >
                <ThemedText
                  className="text-gray-800"
                  style={{ fontFamily: 'Helvetica', fontSize: 11 }}
                >
                  {item.label}
                </ThemedText>
                {item.value === value && (
                  <MaterialCommunityIcons name="check" size={20} color={finalAccentColor} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

export default Dropdown;
