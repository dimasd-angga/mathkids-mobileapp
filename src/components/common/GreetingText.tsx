import { ThemedText } from '@/contexts/ThemeProvider';
import { View } from 'react-native';
import UserInfoText from './UserInfoText';
import { useAuth } from '@/hooks/useAuth';
import TitleWithShadow from './TitleWithShadow';
import moment from 'moment/moment';
import { toRoman } from '@/hooks/useRoman';
// Greeting header text component
const GreetingText = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  return (
    <>
      <TitleWithShadow
        style={{ fontSize: 40, paddingBottom: 12, paddingHorizontal: 24, marginTop: 8 }}
      >
        Hi, {firstName}!
      </TitleWithShadow>
      <View className="flex-row gap-5 -mt-2 self-center">
        {/*<UserInfoText>*/}
        {/*  {user?.grade?.desc ?? '-'}*/}
        {/*  {user?.grade?.lastExam ? toRoman(user?.grade?.lastExam) : '-'}*/}
        {/*</UserInfoText>*/}
        <UserInfoText>B. {moment(user?.birth).format('YYYY')}</UserInfoText>
        <UserInfoText>
          {user?.school?.name || '-'}, {user?.school_grade || '-'}
        </UserInfoText>
      </View>
    </>
  );
};

export default GreetingText;
