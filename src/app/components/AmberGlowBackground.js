import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AmberGlowBackground() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.55],
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.glowOuter,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />
      <View style={styles.glowMid} />
      <View style={styles.glowCore} />
    </View>
  );
}

const GLOW_SIZE = width * 1.3;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOuter: {
    position: 'absolute',
    top: -GLOW_SIZE * 0.35,
    right: -GLOW_SIZE * 0.35,
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(232,163,61,0.10)',
  },
  glowMid: {
    position: 'absolute',
    top: -GLOW_SIZE * 0.25,
    right: -GLOW_SIZE * 0.25,
    width: GLOW_SIZE * 0.65,
    height: GLOW_SIZE * 0.65,
    borderRadius: (GLOW_SIZE * 0.65) / 2,
    backgroundColor: 'rgba(232,163,61,0.08)',
  },
  glowCore: {
    position: 'absolute',
    top: -GLOW_SIZE * 0.15,
    right: -GLOW_SIZE * 0.15,
    width: GLOW_SIZE * 0.35,
    height: GLOW_SIZE * 0.35,
    borderRadius: (GLOW_SIZE * 0.35) / 2,
    backgroundColor: 'rgba(232,163,61,0.06)',
  },
});