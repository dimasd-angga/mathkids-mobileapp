import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/contexts/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useAppNavigation } from '@/hooks/navigation';
import ImagePickerButton from '@/components/common/ImagePickerButton';
import { STRAPI_HOST_URL } from '@/constants/apiEndpoints';
import moment from 'moment';
import CapsuleButton from '@/components/common/CapsuleButton';
import profileStore from '@/stores/profileStore';
import AlertModal from '@/components/common/AlertModal';

export default function StudentProfileScreen() {
  const navigation = useAppNavigation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [contentHeight, setContentHeight] = useState(Dimensions.get('window').height);
  const [profileSectionHeight, setProfileSectionHeight] = useState(0);
  const [tabsHeight, setTabsHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  console.log({ user });

  useEffect(() => {
    const updateContentHeight = () => {
      const windowHeight = Dimensions.get('window').height;
      const remainingHeight = windowHeight - profileSectionHeight - tabsHeight - 50; // 50 for additional padding/margins
      setContentHeight(Math.max(remainingHeight, 300)); // Set a minimum height of 300
    };

    updateContentHeight();

    const dimensionsSubscription = Dimensions.addEventListener('change', updateContentHeight);

    return () => {
      dimensionsSubscription.remove();
    };
  }, [profileSectionHeight, tabsHeight]);

  const handleLogout = () => setIsVisible(true);

  const { fetchHistories, histories, isLoadingHistories } = profileStore();
  console.log('histories', histories);

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = () => {
    fetchHistories();
  };

  const renderHistoryContent = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoadingHistories} onRefresh={onRefresh} />}
        style={styles.historyContent}
      >
        {histories.length > 0 ? (
          histories.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <ThemedText style={styles.historyMessage}>{item.description}</ThemedText>
              <View style={styles.timeContainer}>
                <ThemedText style={styles.timeText}>{item.timeAgo}</ThemedText>
              </View>
            </View>
          ))
        ) : (
          <ThemedText className="text-center">No history found</ThemedText>
        )}
      </ScrollView>
    );
  };

  const settingsMenu = [
    {
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    // {
    //   label: 'Terms And Condition',
    //   onPress: () => navigation.navigate('WebView', { title: 'Terms And Condition', url: 'https://dokidou.com/terms-and-conditions' })
    // },
    // {
    //   label: 'Support',
    //   onPress: () => navigation.navigate('WebView', { title: 'Support', url: 'https://dokidou.com/support' })
    // }
  ];

  const renderSettingsContent = () => (
    <View style={styles.settingsContainer}>
      {settingsMenu.map((item, index) => (
        <CapsuleButton
          key={index}
          text={item.label}
          onPress={item.onPress}
          className="mb-4 w-full"
        />
      ))}
      <View style={{ flex: 1 }} />
      <CapsuleButton
        text="LOGOUT"
        onPress={handleLogout}
        backgroundColor="#FF3B30"
        className="mx-auto mb-7 w-[150px]"
      />
    </View>
  );

  const renderTabs = () => (
    <View
      style={styles.tabsWrapper}
      onLayout={event => {
        const { height } = event.nativeEvent.layout;
        setTabsHeight(height);
      }}
    >
      <View style={styles.tabPillContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' ? styles.activeTab : null]}
          onPress={() => setActiveTab('history')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'history' ? styles.activeTabText : styles.inactiveTabText,
              {
                textShadowColor: '#FFDC00',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 2,
              },
            ]}
          >
            HISTORY
          </ThemedText>
        </TouchableOpacity>

        {/* Right Tab - Settings */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' ? styles.activeTab : null]}
          onPress={() => setActiveTab('settings')}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === 'settings' ? styles.activeTabText : styles.inactiveTabText,
              {
                textShadowColor: '#FFDC00',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 2,
              },
            ]}
          >
            SETTINGS
          </ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.starContainer}>
        <Text style={styles.starDecoration}>★</Text>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerBackground} />
        <View
          style={styles.profileSection}
          onLayout={event => {
            const { height } = event.nativeEvent.layout;
            setProfileSectionHeight(height);
          }}
        >
          <ImagePickerButton
            isDisabled
            imageUri={
              typeof user?.avatar?.formats?.medium?.url === 'string'
                ? STRAPI_HOST_URL + user?.avatar?.formats?.medium?.url
                : user?.avatar?.formats?.medium?.uri ||
                  user?.avatar?.formats?.medium?.url ||
                  (user?.avatar?.formats?.medium?.url
                    ? user.avatar?.formats?.medium?.url
                    : undefined)
            }
            onImagePicked={img => {
              console.log('img', img);
            }}
            avatarStyle={{
              marginBottom: 10,
            }}
          />
          <ThemedText style={styles.name}>{user?.username}</ThemedText>
          <View style={styles.gradeContainer}>
            <ThemedText style={styles.gradeText}>{user?.school_grade}</ThemedText>
          </View>
          <ThemedText style={styles.schoolInfo}>
            {user?.birth ? 'B. ' + moment(user?.birth).format('YYYY') + ' ∙ ' : ''}{' '}
            {user?.school?.name}
          </ThemedText>
        </View>

        <View style={[styles.contentContainer, { minHeight: contentHeight }]}>
          {renderTabs()}
          {activeTab === 'history' ? renderHistoryContent() : renderSettingsContent()}
        </View>
      </View>

      <AlertModal
        title="Taking a Break?"
        subtitle="Do you really want to log out and pause your adventure?"
        submitText="TAKE A BREAK"
        closeText="BACK TO FUN"
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onSubmit={async () => {
          await logout();
          setIsVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00A2FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    paddingTop: 20,
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E75480',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  gradeContainer: {
    backgroundColor: '#FDBA12',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginVertical: 5,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  schoolInfo: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    fontFamily: 'Helvetica',
  },

  tabsWrapper: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    top: -35,
    left: 0,
    right: 0,
  },
  tabPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFC41D',
    borderRadius: 30,
    width: '80%',
    height: 70,
    borderWidth: 6,
    borderColor: '#FFDC00',
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'relative',
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'black',
  },
  inactiveTabText: {
    color: 'black',
  },
  starContainer: {
    position: 'absolute',
    top: -10,
    right: '10%',
    zIndex: 11,
  },
  starDecoration: {
    color: 'white',
    fontSize: 28,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFBE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  historyContent: {
    paddingTop: 40,
  },
  settingsContent: {
    paddingBottom: 16,
  },
  settingsContainer: {
    paddingTop: 40,
    flex: 1,
  },
  historyItem: {
    backgroundColor: '#00A2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0082FC',
    marginBottom: 12,
  },
  historyMessage: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
  settingItem: {
    backgroundColor: '#0082FC',
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  logoutButtonContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E63729',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
});
