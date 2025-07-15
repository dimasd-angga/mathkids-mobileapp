import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Platform, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import TextInput from './TextInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText, useTheme } from '@/contexts/ThemeProvider';

interface DatePickerInputProps {
  label?: string;
  value?: string; // ISO string or formatted date
  onChange: (date: string) => void;
  placeholder?: string;
  accentColor?: string;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  accentColor,
  error,
  minimumDate,
  maximumDate,
}) => {
  const theme = useTheme();
  const fallbackColor = theme.colors.primary;
  const finalAccentColor = accentColor || fallbackColor;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  // Keep selectedDate in sync with value prop
  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      if (!selectedDate || selectedDate.getTime() !== newDate.getTime()) {
        setSelectedDate(newDate);
      }
    }
  }, [value]);
  const [show, setShow] = useState(false);

  const openSheet = useCallback(() => {
    setShow(true);
  }, []);

  const closeSheet = useCallback(() => {
    setShow(false);
  }, []);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      onChange(date.toISOString());
    }
    if(Platform.OS === 'android') closeSheet();
  };

  return (
    <View style={{ width: '100%' }}>
      <View className="relative flex-row items-center w-full">

      <TouchableOpacity onPress={openSheet} activeOpacity={0.7} className="w-full">
        <TextInput
          label={label}
          value={selectedDate ? selectedDate.toLocaleDateString() : ''}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
          accentColor={accentColor}
          error={error}
          icon="calendar"
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShow(!show)} className="absolute right-14 mb-3">
          <MaterialCommunityIcons
            name={show ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={finalAccentColor}
          />
      </TouchableOpacity>
      </View>
      {Platform.OS === 'ios' && show && (
        <TouchableWithoutFeedback onPress={() => setShow(false)}>
          <View
            style={{
              position: 'absolute',
              top: 60, // Adjust based on your input height
              left: 0,
              right: 0,
              zIndex: 999,
              backgroundColor: 'white',
              borderRadius: 8,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              padding: 8,
            }}
          >
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={{ width: '100%' }}
            />
            <TouchableOpacity className='flex-row items-center self-end' onPress={() => setShow(false)}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={finalAccentColor}
                />
              <ThemedText>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      )}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

export default DatePickerInput;
