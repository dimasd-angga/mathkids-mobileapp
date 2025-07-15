import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/contexts/ThemeProvider';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import IcPencil from '@/assets/images/ic-pencil.svg'
import { useAuth } from '@/hooks/useAuth';
import { useRoute } from '@react-navigation/native';
import RouteNames from '@/constants/router';
import MountainEverest from '@/assets/images/mountain-everest.svg';
import MountainJayaWijaya from '@/assets/images/mountain-jaya-wijaya.svg';
import MountainAcon from '@/assets/images/mountain-acon.svg';
import MountainDenali from '@/assets/images/mountain-denali.svg';

interface ImagePickerButtonProps {
  imageUri?: string;
  onImagePicked: (image: ImagePicker.ImagePickerAsset) => void;
  avatarStyle?: StyleProp<ImageStyle>;
  isDisabled?: boolean;
}

export default function ImagePickerButton({ isDisabled, imageUri, onImagePicked, avatarStyle }: ImagePickerButtonProps) {
  const route = useRoute();
  const { user } = useAuth();
  const IMG_CONTAINER_SIZE = 104;
  // const IMG_SIZE = IMG_CONTAINER_SIZE + 86;
  const IMG_SIZE = 80;
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      onImagePicked(asset);
    }
  };

  const renderImage = () => {
    const caseIndex = user?.grade?.index?.toString()
    
    switch (caseIndex) {
      case '1':
        return (
          <MountainJayaWijaya
            style={{marginTop: -5}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      case '2':
        return (
          <MountainDenali
            style={{marginTop: -5}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      case '3':
        return (
          <MountainAcon
            style={{marginTop: -5}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
      default:
        return (
          <MountainEverest
            style={{marginTop: -5}}
            width={IMG_SIZE}
            height={IMG_SIZE}
          />
        );
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} disabled={isDisabled} className='relative'>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.avatar, avatarStyle]} />
      ) : (
        <View style={[styles.avatar, styles.placeholder, avatarStyle]}>
          <MaterialIcon name="person" size={100} color="#888" />
        </View>
      )}
      {route.name === RouteNames.EditProfile && <IcPencil style={{
        position: 'absolute',
        top: 0,
        right: 0,
      }} width={31} height={31} />}

      {route.name === RouteNames.Account && user?.grade?.lastExam && <View className='absolute bottom-0 -right-2 bg-[#E8BA00] h-[52px] w-[52px] border-4 border-white rounded-full items-center justify-start overflow-hidden'>
        {renderImage()}
        {/* <ThemedText className='text-2xl text-white'>{user?.grade?.lastExam}</ThemedText> */}
      </View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarButton: {
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0082FC',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
