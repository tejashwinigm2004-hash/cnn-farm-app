import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedDotsBackground() {
  const rotateOuter = useRef(new Animated.Value(0)).current;
  const rotateInner = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateOuter, {
        toValue: 1,
        duration: 24000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateInner, {
        toValue: 1,
        duration: 18000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const outerSpin = rotateOuter.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerSpin = rotateInner.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.5],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.ringOuter,
          {
            transform: [{ rotate: outerSpin }],
            opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ringInner,
          {
            transform: [{ rotate: innerSpin }],
            opacity,
          },
        ]}
      />
    </View>
  );
}

const RING_SIZE_OUTER = width * 1.1;
const RING_SIZE_INNER = width * 0.75;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    width: RING_SIZE_OUTER,
    height: RING_SIZE_OUTER,
    borderRadius: RING_SIZE_OUTER / 2,
    borderWidth: 1.5,
    borderColor: '#E6B800',
    borderStyle: 'dashed',
    top: height * 0.15,
  },
  ringInner: {
    position: 'absolute',
    width: RING_SIZE_INNER,
    height: RING_SIZE_INNER,
    borderRadius: RING_SIZE_INNER / 2,
    borderWidth: 1,
    borderColor: '#39d353',
    borderStyle: 'dotted',
    top: height * 0.3,
  },
});