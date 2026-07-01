import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface CountUpStatProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

function CountUpStat({ value, suffix = '', label, delay = 0 }: CountUpStatProps) {
  const [display, setDisplay] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();

    const listenerId = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration: 1200,
      delay,
      useNativeDriver: false,
    }).start();

    return () => anim.removeListener(listenerId);
  }, []);

  return (
    <Animated.View style={[styles.statBox, { opacity: fadeAnim }]}>
      <Text style={styles.statNumber}>{display}{suffix}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

interface ParticleFieldProps {
  count?: number;
}

function ParticleField({ count = 14 }: ParticleFieldProps) {
  const particles = useRef(
    Array.from({ length: count }).map(() => ({
      anim: new Animated.Value(0),
      x: Math.random() * width,
      size: 3 + Math.random() * 4,
      duration: 4000 + Math.random() * 3000,
      delay: Math.random() * 3000,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.anim, { toValue: 1, duration: p.duration, delay: p.delay, useNativeDriver: true }),
          Animated.timing(p.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#39d353',
            opacity: p.anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.6, 0.6, 0] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [400, -50] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

export function FarmStatsSection() {
  return (
    <View style={styles.statsWrap}>
      <ParticleField count={16} />
      <Text style={styles.statsTitle}>Why farmers trust us</Text>
      <View style={styles.statsRow}>
        <CountUpStat value={100} suffix="%" label="Organic" delay={100} />
        <CountUpStat value={6} suffix="AM" label="Daily delivery" delay={250} />
        <CountUpStat value={0} suffix="" label="Preservatives" delay={400} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsWrap: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#0d1426',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(57,211,83,0.15)',
  },
  statsTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { color: '#39d353', fontSize: 28, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, textAlign: 'center' },
});