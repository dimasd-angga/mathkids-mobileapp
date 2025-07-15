import {
  createNavigationContainerRef,
  NavigationProp,
  Route,
  RouteProp,
  StackActions,
  useNavigation,
  useNavigationState,
  useRoute,
} from '@react-navigation/native';
import {RootStackParamList} from '@/navigation/NavigationTypes';
import RouteNames from '@/constants/router';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
function useAppNavigation<T extends RouteNames>(): NavigationProp<
  RootStackParamList,
  T
> & {
  getCurrentRoute: () => Route<string> | undefined;
} {
  return useNavigation<
    NavigationProp<RootStackParamList, T> & {
      getCurrentRoute: () => Route<string> | undefined;
    }
  >();
}

function useAppRoute<T extends RouteNames>(): RouteProp<
  RootStackParamList,
  T
> {
  return useRoute<RouteProp<RootStackParamList, T>>();
}

function navigate<RouteName extends keyof RootStackParamList>(
  ...args: RouteName extends unknown
    ? undefined extends RootStackParamList[RouteName]
      ?
          | [screen: RouteName]
          | [screen: RouteName, params: RootStackParamList[RouteName]]
      : [screen: RouteName, params: RootStackParamList[RouteName]]
    : never
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args);
  }
}

function reset(params: any) {
  if (navigationRef.isReady()) {
    navigationRef.reset(params);
  }
}

function replace(name: any, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

function isTabActive(tabName: string): boolean {
  const route = useNavigationState(state => state.routes[state.index]);
  return route.name === tabName;
}

export {
  useAppNavigation,
  useAppRoute,
  navigate,
  reset,
  replace,
  isTabActive,
};
