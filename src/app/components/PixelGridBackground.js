import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');
const CELL = 20;
const GAP = 5;
const COLS = Math.floor(width / (CELL + GAP));

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function Cell({ x, y, animate }) {
  const opacity = useRef(
    new Animated.Value(animate ? 0.15 : randomBetween(0.05, 0.22))
  ).current;

  useEffect(() => {
    if (!animate) return;
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: randomBetween(0.5, 0.85),
          duration: randomBetween(1200, 2200),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: randomBetween(0.05, 0.2),
          duration: randomBetween(1200, 2200),
          useNativeDriver: true,
        }),
      ]).start(loop);
    };
    const t = setTimeout(loop, randomBetween(0, 2000));
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CELL,
        height: CELL,
        borderRadius: 4,
        backgroundColor: '#3d9bff',
        opacity,
      }}
    />
  );
}

export default function PixelGridBackground({ height = 340 }) {
  const rows = Math.ceil(height / (CELL + GAP));
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      const animate = Math.random() < 0.08;
      cells.push(
        <Cell key={`${r}-${c}`} x={c * (CELL + GAP)} y={r * (CELL + GAP)} animate={animate} />
      );
    }
  }

  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      {cells}
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