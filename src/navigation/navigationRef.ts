import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function reset(index: number, routes: Array<{ name: string; params?: any }>) {
  if (navigationRef.isReady()) {
    (navigationRef as any).reset({
      index,
      routes,
    });
  }
}

