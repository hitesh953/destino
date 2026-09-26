/**
 * Navigation ref usable outside of React components (e.g. from a push
 * notification tap handler) to navigate the root navigator directly.
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// A notification tap can arrive before the navigator has mounted (cold
// start). Queue the target route and flush it once NavigationContainer
// reports onReady.
let pendingRoute: keyof RootStackParamList | null = null;

export function navigateToRoute(routeName: keyof RootStackParamList): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(routeName as never);
  } else {
    pendingRoute = routeName;
  }
}

export function flushPendingNavigation(): void {
  if (pendingRoute && navigationRef.isReady()) {
    const target = pendingRoute;
    pendingRoute = null;
    navigationRef.navigate(target as never);
  }
}
