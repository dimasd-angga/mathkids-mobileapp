import FormUser from '@/components/common/FormUser';
import ImagePickerButton from '@/components/common/ImagePickerButton';
import { STRAPI_HOST_URL } from '@/constants/apiEndpoints';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useAppNavigation } from '@/hooks/navigation';
import { useAuth } from '@/hooks/useAuth';
import profileStore from '@/stores/profileStore';
import { RegisterData } from '@/types/auth.types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import gradeStore from '@/stores/gradeStore';

export default function EditProfileScreen() {
  const navigation = useAppNavigation();
  const grades = gradeStore(state => state.grades);
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 150; // headerBackground + yellow header + profile section/profile pic
  // Animate opacity and translateY: fade out and slide up after 40px scroll

  const { user } = useAuth();
  const { updateProfile, isLoadingUpdateProfile } = profileStore(state => state);
  const [avatar, setAvatar] = useState(user?.avatar?.url);

  const avatarUri = typeof avatar === 'string'
    ? STRAPI_HOST_URL + avatar
    : avatar?.uri || avatar?.url || (user?.avatar?.url ? user.avatar.url : undefined)

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="flex self-end mx-4 mt-10"
      >
        <ThemedText className={'text-2xl text-white p-4'}>{'<Back'}</ThemedText>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingTop: HEADER_HEIGHT }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.mainContainer}>
           


            <View
              style={{
                opacity: 1,
                position: 'absolute',
                top: -130,
                left: 0,
                right: 0,
                zIndex: 1,
                alignItems: 'center',
                paddingTop: 0,
                paddingBottom: 0,
                minHeight: HEADER_HEIGHT,
                justifyContent: 'space-between'
              }}
            >
              {/* <View style={styles.headerBackground} /> */}
              <View className={'py-2 px-5 bg-[#F8BF1C] my-[14px] flex self-center rounded-full'}>
                <ThemedText className={'text-xl text-white'}>Edit Your Profile</ThemedText>
              </View>
              {/* <View style={styles.profileSection}/> */}
              <ImagePickerButton
                imageUri={avatarUri}
                onImagePicked={img => setAvatar(img)}
                avatarStyle={{
                  marginBottom: 20
                }}
              />
            </View>
            <FormUser
              error={''}
              type="profile"
              onSubmit={(formData) => {
                const payload = { avatar }

                if (formData.grade?.length > 0) {
                  // Object.assign(payload, { grade: formData.grade });
                  const grade = grades.find((grade: any) => grade.id.toString() === formData.grade);
                  if (grade) Object.assign(payload, { school_grade: grade.title });
                }

                if (formData.school?.length > 0) Object.assign(payload, { school: formData.school });

                if (formData.firstName?.length > 0) Object.assign(payload, { firstName: formData.firstName });

                if (formData.username?.length > 0) Object.assign(payload, { username: formData.username });

                if (formData.email?.length > 0) Object.assign(payload, { email: formData.email });

                if (formData.password?.length > 0) Object.assign(payload, { password: formData.password });

                console.log("payload", payload);
                updateProfile(user?.id.toString() || '', payload as RegisterData)
              }}
              isLoading={isLoadingUpdateProfile}
            />
          </View>
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00A2FF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#CCF0FF',
    paddingBottom: 50,
    paddingHorizontal: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 48
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    backgroundColor: '#00A2FF',
  },
  profileSection: {
    paddingTop: 0,
    paddingBottom: 50,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: -20,
    position: 'relative',
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    borderRadius: 60,
    padding: 5,
    borderWidth: 8,
    borderColor: '#FFDC00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E75480',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  starContainer: {
    position: 'absolute',
    top: -10,
    right: '30%',
    zIndex: 11,
  },
  starDecoration: {
    color: 'white',
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#CCF0FF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 40,
    marginTop: -20,
    paddingBottom: 40,
  },
  singleContent: {
    paddingHorizontal: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A2FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#00A2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0082FC',
    marginBottom: 12,
  },
  infoBoxText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
});
