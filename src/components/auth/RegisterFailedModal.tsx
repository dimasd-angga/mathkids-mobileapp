import Modal from 'react-native-modal';
import { TouchableOpacity, View } from 'react-native';
import CloseSVG from '@/assets/images/close.svg';
import RegisterFailed from '@/assets/images/register-failed.svg';
import OutlinedText from '@/components/common/OutlinedText';
import { ThemedText } from '@/contexts/ThemeProvider';
import CapsuleButton from '@/components/common/CapsuleButton';
import React from 'react';

interface IModalProps {
  showModal: boolean;
  handleClose: () => void;
  errorMessage: string | null;
}

const RegisterFailedModal = ({ showModal, handleClose, errorMessage }: IModalProps) => {
  return (
    <Modal isVisible={showModal}>
      <View className={'bg-[#01B3FF] rounded-2xl p-5 border-4 border-[#CCF0FF] relative'}>
        <TouchableOpacity className={'absolute right-5 top-5'} onPress={handleClose}>
          <CloseSVG />
        </TouchableOpacity>
        <View className="items-center justify-center mb-3">
          <RegisterFailed />
        </View>

        <View className={'flex items-center gap-3'}>
          <OutlinedText
            text="Login Failed!"
            className={' right-[55px]'}
            fontFamily={'CooperBlack'}
            fontSize={20}
            strokeColor="#FC0000"
            strokeWidth={2}
            textColor="#FFFFFF"
          />
          <ThemedText className={'text-white mb-4'}>{errorMessage}</ThemedText>
        </View>
        <View className={'self-center'}>
          <CapsuleButton
            className={'w-[200px] mb-3'}
            backgroundColor={'#FC0000'}
            text="TRY AGAIN"
            onPress={handleClose}
          />
        </View>
      </View>
    </Modal>
  );
};

export default RegisterFailedModal;
