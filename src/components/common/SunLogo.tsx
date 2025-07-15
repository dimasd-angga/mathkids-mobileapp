import { View, Image } from 'react-native';

const SunLogo = ({ className }: { className?: string }) => (
  <View className={`flex justify-center items-center ${className}`}>
    <View className="flex">
      <View className="w-44 h-44 rounded-full bg-[#FFF200] absolute  -left-20 z-0" />
      <Image
        source={require('../../../assets/images/logo.png')}
        className="w-44 h-20 mt-10 z-10"
        resizeMode="contain"
      />
    </View>
  </View>
);

export default SunLogo;
