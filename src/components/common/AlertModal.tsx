import Modal from 'react-native-modal';
import { TouchableOpacity, View } from 'react-native';
import DangerSVG from '@/assets/images/danger.svg';
import { ThemedText } from '@/contexts/ThemeProvider';
import CapsuleButton from '@/components/common/CapsuleButton';
import React from 'react';
import CloseSVG from '@/assets/images/close.svg';

interface IModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  subtitle?: string;
  submitText?: string;
  closeText?: string;
}

const AlertModal = ({ isVisible, onClose, onSubmit, title, subtitle, submitText = 'Submit', closeText = 'Cancel' }: IModalProps) => {
  return (
    <Modal isVisible={isVisible}>
      <View className={'bg-[#01B3FF] rounded-2xl px-10 relative w-[332px] self-center'}>
        <TouchableOpacity
          className={'absolute top-7 right-7 z-10'}
          onPress={onClose}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <CloseSVG />
        </TouchableOpacity>
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 10,
          }}
          className="items-center justify-center -top-[60px] -mb-[110px]"
        >
          <DangerSVG />
        </View>

        <View className={'flex gap-3'}>
          {/* <ThemedText className={'-mb-3 text-4xl text-white'}>{title}</ThemedText>
          <ThemedText className={'-mb-3 text-4xl text-white'}>{subtitle}</ThemedText> */}
          <ThemedText className={'mb-2 text-4xl text-white'}>{title}</ThemedText>
          <ThemedText className={'mb-8 text-white'}>
            {subtitle}
          </ThemedText>
        </View>
        <View className={'self-center mb-1'}>
          <CapsuleButton className={'mb-[10px] w-[250px]'} text={closeText} onPress={onClose} />
        </View>
        <View className={'self-center mb-5'}>
          <TouchableOpacity
            className={'py-3 mb-3 rounded-full border-2 border-white w-[250px]'}
            onPress={onSubmit}
          >
            <ThemedText className={'text-xl text-center text-white'}>{submitText}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
