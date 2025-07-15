import Modal from 'react-native-modal';
import { TouchableOpacity, View } from 'react-native';
import CloseSVG from '@/assets/images/close.svg';
import LoginFailedSVG from '@/assets/images/login-failed.svg';
import OutlinedText from '@/components/common/OutlinedText';
import { ThemedText } from '@/contexts/ThemeProvider';
import CapsuleButton from '@/components/common/CapsuleButton';
import React from 'react';

interface IModalProps {
  showModal: boolean;
  handleClose: () => void;
}

const LoginFailedModal = ({ showModal, handleClose }: IModalProps) => {
  return (
    <Modal isVisible={showModal}>
      <View className={'bg-[#01B3FF] rounded-2xl p-5 border-4 border-[#CCF0FF] relative'}>
        <TouchableOpacity className={'absolute top-3 right-3 justify-center items-center w-10 h-10'} onPress={handleClose}>
          <CloseSVG />
        </TouchableOpacity>
        <View className="justify-center items-center mb-3">
          <LoginFailedSVG />
        </View>

        <View className={'flex gap-3 items-center'}>
          <OutlinedText
            text="Login Failed!"
            className={'right-[55px]'}
            fontFamily={'CooperBlack'}
            fontSize={20}
            strokeColor="#FC0000"
            strokeWidth={2}
            textColor="#FFFFFF"
          />
          <ThemedText className={'mb-4 text-white'}>Please check your email or password</ThemedText>
        </View>
        <View className={'self-center'}>
          <CapsuleButton
            className={'mb-3 w-[200px]'}
            backgroundColor={'#FC0000'}
            text="TRY AGAIN"
            onPress={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LoginFailedModal;
