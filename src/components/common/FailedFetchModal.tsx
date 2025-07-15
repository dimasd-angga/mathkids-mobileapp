import Modal from 'react-native-modal';
import { TouchableOpacity, View } from 'react-native';
import CloseSVG from '@/assets/images/close.svg';
import FailedNetwork from '@/assets/images/ic-network.svg';
import OutlinedText from '@/components/common/OutlinedText';
import { ThemedText } from '@/contexts/ThemeProvider';
import CapsuleButton from '@/components/common/CapsuleButton';
import React from 'react';
import appStore from '@/stores/appStore';
import UserInfoText from './UserInfoText';

const FailedFetchModal = () => {
  const {isFailedFetch, resetFailedFetch, failedFetch} = appStore()

  return (
    <Modal isVisible={isFailedFetch}>
      <View className={'bg-[#01B3FF] rounded-2xl p-5 border-4 border-[#CCF0FF] relative'}>
        <TouchableOpacity className={'absolute top-5 right-5'} onPress={() => resetFailedFetch()}>
          <CloseSVG />
        </TouchableOpacity>
        
        <View className="justify-center items-center -mt-[90px]">
          <FailedNetwork />
        </View>

        <View className={'flex flex-col gap-3 items-center'}>
          <OutlinedText
            text="Load Failed"
            className={'mb-[10px] right-[85px]'}
            fontFamily={'CooperBlack'}
            fontSize={32}
            strokeColor="#FC0000"
            strokeWidth={2}
            textColor="#FFFFFF"
          />
          <UserInfoText style={{
            marginBottom: 16,
            textAlign: 'center',
            fontWeight: "bold",
            maxWidth: "80%",            
          }}>{failedFetch?.message}</UserInfoText>
        </View>
        <View className={'self-center'}>
          <CapsuleButton
            className={'mb-3 w-[260px]'}
            backgroundColor={'#FC0000'}
            text="TRY AGAIN"
            onPress={() => resetFailedFetch()}
          />
        </View>
      </View>
    </Modal>
  );
};

export default FailedFetchModal;
