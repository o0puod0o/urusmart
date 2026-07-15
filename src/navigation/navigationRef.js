import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();
let pendingNavigation = null;

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }
  pendingNavigation = { name, params };
}

export function flushPendingNavigation() {
  if (!navigationRef.isReady() || !pendingNavigation) return;
  const { name, params } = pendingNavigation;
  pendingNavigation = null;
  navigationRef.navigate(name, params);
}
