import { ThemedText } from '@/contexts/ThemeProvider';
import { StyleProp, TextStyle } from 'react-native';

const UserInfoText = ({
  children,
  style,
  classNames,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  classNames?: string;
}) => (
  <ThemedText
    className={`text-white ${classNames}`}
    style={[{ fontSize: 12, fontFamily: 'Helvetica' }, style]}
  >
    {children}
  </ThemedText>
);

export default UserInfoText;
