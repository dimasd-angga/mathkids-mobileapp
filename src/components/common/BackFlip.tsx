import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import BackSVG from '@/assets/images/back-assesment-detail.svg'
import { LinearGradient } from 'expo-linear-gradient'
import { SCREEN_WIDTH } from '@/utils/constant'
import Constants from 'expo-constants';
import { useAppNavigation } from '@/hooks/navigation'
const statusBarHeight = 0 //Constants.statusBarHeight;

const BackFlip = () => {
    const navigation = useAppNavigation();
    return (
        <>
            <TouchableOpacity style={{
                zIndex: 10,
                position: 'absolute',
                top: statusBarHeight,
                right: 0,
            }} onPress={() => navigation.goBack()}>
                <BackSVG />
            </TouchableOpacity>
            <LinearGradient
                colors={['#FFC41D', '#FFFFBE', 'rgba(255, 255, 190, 0)']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{
                    position: 'absolute',
                    top: statusBarHeight,
                    right: 0,
                    height: 200,
                    width: SCREEN_WIDTH / 2,
                    zIndex: 0,
                }}
            />
        </>
    )
}

export default BackFlip