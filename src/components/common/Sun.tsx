import { View } from 'react-native';

const Sun = ({ className, style }: { className?: string; style?: any }) => (
  <View className={`flex justify-center items-center ${className}`} style={style}>
    <View className="flex">
      <View className="w-44 h-44 rounded-full bg-[#FFF200] absolute  -left-20 z-0" />
      <View className="w-44 h-20 mt-10" />
    </View>
  </View>
);

export default Sun;
