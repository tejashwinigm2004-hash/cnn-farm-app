import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
 
export default function PressableScale({ onPress, style, children }) {
  const scale = useRef(new Animated.Value(1)).current;
 
  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };
 
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };
 
  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}