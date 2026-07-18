import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
 
export default function HeroBackground({ height = 380 }) {
  const pulse = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
 
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.75] });
 
  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      {/* Base gradient — warm dark amber/copper tones */}
      <LinearGradient
        colors={['#2A1608', '#150B04', '#0a0a0a']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
 
      {/* Soft warm wash across the top */}
      <Animated.View style={{ opacity: glowOpacity }}>
        <LinearGradient
          colors={['rgba(232,163,61,0.22)', 'rgba(232,163,61,0.06)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { height: height * 0.65 }]}
        />
      </Animated.View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});