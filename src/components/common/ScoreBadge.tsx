import { ThemedText } from '@/contexts/ThemeProvider';
import { View } from 'react-native';
import RotatingBadge from './RotatingBadge';

const ScoreBadge = ({ score }: { score: string }) => {

  return (
    <RotatingBadge color="#F2C900">
      <View className={'flex flex-column items-center justify-center'}>
        <ThemedText className="text-black text-[18px]">You've Scored</ThemedText>
        <ThemedText className="text-black text-7xl -mt-2">{score}</ThemedText>
      </View>
    </RotatingBadge>
  );
};

export default ScoreBadge;
