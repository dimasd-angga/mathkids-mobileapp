import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface OutlinedTextProps {
  text: string;
  fontSize?: number;
  strokeColor?: string;
  strokeWidth?: number;
  textColor?: string;
  fontFamily?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}

/**
 * A component that renders text with a solid, consistent outline/stroke effect
 * Ensures font consistency between stroke and inner text
 */
const OutlinedText: React.FC<OutlinedTextProps> = ({
  text,
  fontSize = 36,
  strokeColor = '#000000',
  strokeWidth = 4,
  textColor = '#FF00FF', // Magenta default to match example
  fontFamily,
  style,
  textStyle,
  className,
}) => {
  // First, create an object with the font family if provided
  const fontSettings: Partial<TextStyle> = fontFamily ? { fontFamily } : {};

  // Create the base text style that will be used by both main text and stroke text
  const baseTextStyle: TextStyle = {
    fontSize,
    fontWeight: 'bold',
    ...fontSettings, // Apply font family to both main and stroke text
    color: strokeColor, // Outline color
    ...textStyle, // Custom text styles applied to both
  };

  // Style for the main text - only override the color
  const mainTextStyle: TextStyle = {
    ...baseTextStyle,
    color: textColor, // Inner text color
  };

  // Create dense grid of positions for the stroke
  const createStrokePositions = () => {
    const positions = [];
    const maxOffset = Math.ceil(strokeWidth);

    // Create a dense grid of positions to ensure solid coverage
    for (let x = -maxOffset; x <= maxOffset; x++) {
      for (let y = -maxOffset; y <= maxOffset; y++) {
        // Skip the center position (that will be our main text)
        if (x === 0 && y === 0) continue;

        // Use all positions up to the maximum offset to create a solid stroke
        // This creates a much denser coverage of positions
        if (Math.sqrt(x * x + y * y) <= maxOffset) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  };

  const strokePositions = createStrokePositions();

  return (
    <View style={[styles.container, style]} className={className}>
      {/* Render stroke text copies at all positions */}
      {strokePositions.map((pos, index) => (
        <Text
          key={`stroke-${index}`}
          style={[
            styles.textAbsolute,
            baseTextStyle,
            {
              left: pos.x,
              top: pos.y,
            },
          ]}
        >
          {text}
        </Text>
      ))}

      {/* Main text rendered on top */}
      <Text style={[styles.textAbsolute, mainTextStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    // Add some padding to account for the stroke overflow
    padding: 10,
  },
  textAbsolute: {
    position: 'absolute',
  },
});

export default OutlinedText;
