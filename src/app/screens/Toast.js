import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
 
export default function Toast({ message, visible, type = 'success' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
 
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
 
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2500);
 
      return () => clearTimeout(timer);
    }
  }, [visible, message]);
 
  if (!visible && opacity._value === 0) return null;
 
  return (
    <Animated.View
      style={[
        styles.toast,
        type === 'success' ? styles.success : styles.error,
        { opacity, transform: [{ translateY }] },
      ]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}
 
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  success: {
    backgroundColor: 'rgba(57,211,83,0.95)',
  },
  error: {
    backgroundColor: 'rgba(255,68,68,0.95)',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});