import { Animated } from 'react-native';

export const tabBarTranslateY = new Animated.Value(0);
export const TAB_BAR_HEIGHT = 72;

let lastOffset = 0;

export function handleTabBarScroll(offsetY: number) {
  const diff = offsetY - lastOffset;

  if (diff > 5 && offsetY > 50) {
    // scrolling down -> hide
    Animated.timing(tabBarTranslateY, {
      toValue: TAB_BAR_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start();
  } else if (diff < -5 || offsetY <= 0) {
    // scrolling up -> show
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  lastOffset = offsetY;
}