import { useTheme } from '@/contexts/ThemeProvider';
import { Text } from 'react-native';

const TitleWithShadow = ({
  text = '',
  children,
  className = '',
  style,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  style?: any;
  text?: string;
}) => {
  const theme = useTheme();
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[
        {
          fontFamily: theme.fonts.regular,
          lineHeight: 46,
          color: 'white',
          fontSize: 40,
          fontWeight: '900',
          textShadowColor: 'rgba(0, 0, 0, 0.25)',
          textShadowOffset: { width: 0, height: 8 },
          textShadowRadius: 10,
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          maxWidth: 400,
        },
        style,
      ]}
      {...props}
    >
      {children || text}
    </Text>
  );
};
export default TitleWithShadow;
