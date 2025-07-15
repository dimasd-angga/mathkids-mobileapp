import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SvgXml } from 'react-native-svg';
import BookSelectionScreen from '@/screens/books/BookSelectionScreen';
import { BottomTabParamList } from '@/navigation/NavigationTypes';
import { ThemedText } from '@/contexts/ThemeProvider';
import StudentProfileScreen from '@/screens/profile/StudentProfileScreen';
import ReportScreen from '@/screens/report/ReportScreen';
import { LinearGradient } from 'expo-linear-gradient';

const homeIconXml = `
<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19.33 6.01002L12.78 0.770018C11.5 -0.249982 9.49996 -0.259982 8.22996 0.760018L1.67996 6.01002C0.739963 6.76002 0.169963 8.26002 0.369963 9.44002L1.62996 16.98C1.91996 18.67 3.48996 20 5.19996 20H15.8C17.49 20 19.09 18.64 19.38 16.97L20.64 9.43002C20.82 8.26002 20.25 6.76002 19.33 6.01002ZM11.25 16C11.25 16.41 10.91 16.75 10.5 16.75C10.09 16.75 9.74996 16.41 9.74996 16V13C9.74996 12.59 10.09 12.25 10.5 12.25C10.91 12.25 11.25 12.59 11.25 13V16Z" fill="white"/>
</svg>
`;

const reportIconXml = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.29004 6.29C7.87004 6.29 7.54004 5.95 7.54004 5.54V2.75C7.54004 2.34 7.87004 2 8.29004 2C8.71004 2 9.04004 2.34 9.04004 2.75V5.53C9.04004 5.95 8.71004 6.29 8.29004 6.29Z" fill="white"/>
<path d="M15.71 6.29C15.29 6.29 14.96 5.95 14.96 5.54V2.75C14.96 2.33 15.3 2 15.71 2C16.13 2 16.46 2.34 16.46 2.75V5.53C16.46 5.95 16.13 6.29 15.71 6.29Z" fill="white"/>
<path d="M19.57 4.5C18.91 4.01 17.96 4.48 17.96 5.31V5.41C17.96 6.58 17.12 7.66 15.95 7.78C14.6 7.92 13.46 6.86 13.46 5.54V4.5C13.46 3.95 13.01 3.5 12.46 3.5H11.54C10.99 3.5 10.54 3.95 10.54 4.5V5.54C10.54 6.33 10.13 7.03 9.51 7.42C9.42 7.48 9.32 7.53 9.22 7.58C9.13 7.63 9.03 7.67 8.92 7.7C8.8 7.74 8.67 7.77 8.53 7.78C8.37 7.8 8.21 7.8 8.05 7.78C7.91 7.77 7.78 7.74 7.66 7.7C7.56 7.67 7.46 7.63 7.36 7.58C7.26 7.53 7.16 7.48 7.07 7.42C6.44 6.98 6.04 6.22 6.04 5.41V5.31C6.04 4.54 5.22 4.08 4.57 4.41C4.56 4.42 4.55 4.42 4.54 4.43C4.5 4.45 4.47 4.47 4.43 4.5C4.4 4.53 4.36 4.55 4.33 4.58C4.05 4.8 3.8 5.05 3.59 5.32C3.48 5.44 3.39 5.57 3.31 5.7C3.3 5.71 3.29 5.72 3.28 5.74C3.19 5.87 3.11 6.02 3.04 6.16C3.02 6.18 3.01 6.19 3.01 6.21C2.95 6.33 2.89 6.45 2.85 6.58C2.82 6.63 2.81 6.67 2.79 6.72C2.73 6.87 2.69 7.02 2.65 7.17C2.61 7.31 2.58 7.46 2.56 7.61C2.54 7.72 2.53 7.83 2.52 7.95C2.51 8.09 2.5 8.23 2.5 8.37V17.13C2.5 19.82 4.68 22 7.37 22H16.63C19.32 22 21.5 19.82 21.5 17.13V8.37C21.5 6.78 20.74 5.39 19.57 4.5ZM12 17.42H7.36C6.95 17.42 6.61 17.08 6.61 16.67C6.61 16.25 6.95 15.91 7.36 15.91H12C12.42 15.91 12.75 16.25 12.75 16.67C12.75 17.08 12.42 17.42 12 17.42ZM14.78 13.71H7.36C6.95 13.71 6.61 13.37 6.61 12.96C6.61 12.54 6.95 12.2 7.36 12.2H14.78C15.2 12.2 15.54 12.54 15.54 12.96C15.54 13.37 15.2 13.71 14.78 13.71Z" fill="white"/>
</svg>
`;

const accountIconXml = `
<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 12C15.2614 12 17.5 9.76142 17.5 7C17.5 4.23858 15.2614 2 12.5 2C9.73858 2 7.5 4.23858 7.5 7C7.5 9.76142 9.73858 12 12.5 12Z" fill="white"/>
<path d="M12.5002 14.5C7.49016 14.5 3.41016 17.86 3.41016 22C3.41016 22.28 3.63016 22.5 3.91016 22.5H21.0902C21.3702 22.5 21.5902 22.28 21.5902 22C21.5902 17.86 17.5102 14.5 12.5002 14.5Z" fill="white"/>
</svg>
`;

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ xml, focused, label }: { xml: string; focused: boolean; label: string }) => {
  const fillColor = focused ? 'white' : 'rgba(255, 255, 255, 0.61)';
  const updatedXml = xml.replace(/fill="white"/g, `fill="${fillColor}"`);

  return (
    <View style={[styles.iconContainer, focused && styles.focusedIconContainerBase]}>
      {focused ? (
        <LinearGradient
          colors={['#FFC41D', '#D98600']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <SvgXml xml={updatedXml} width={20} height={20} />
          <ThemedText
            className={'text-[11px] text-white mt-1'}
            style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}
          >
            {label}
          </ThemedText>
        </LinearGradient>
      ) : (
        <>
          <SvgXml xml={updatedXml} width={20} height={20} />
          <ThemedText
            className={'text-[11px] text-white mt-1'}
            style={{ fontFamily: 'Helvetica', fontWeight: 'bold' }}
          >
            {label}
          </ThemedText>
        </>
      )}
    </View>
  );
};

const BottomNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconXml;
          if (route.name === 'Home') {
            iconXml = homeIconXml;
          } else if (route.name === 'Report') {
            iconXml = reportIconXml;
          } else if (route.name === 'Account') {
            iconXml = accountIconXml;
          }

          return <TabIcon xml={iconXml!} focused={focused} label={route.name} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={BookSelectionScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Account" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingBottom: 5,
    paddingTop: 15,
    backgroundColor: '#019CFF',
    borderTopWidth: 2,
    borderTopColor: '#fff',
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    fontSize: 18,
    fontFamily: 'CooperBlack',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedIconContainerBase: {
    backgroundColor: '#FFC41D',
    shadowColor: '#000',
    borderWidth: 3,
    borderColor: '#eeeeee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    borderRadius: 12,
    elevation: 1,
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNavigator;
