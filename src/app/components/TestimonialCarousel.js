import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
 
const TESTIMONIALS = [
  { quote: 'The milk tastes just like what we got back home in our village. My kids actually drink it now!', name: 'Anitha R., Bengaluru' },
  { quote: 'Delivered fresh by 6AM, every single day without fail. Never going back to store-bought.', name: 'Suresh K., Mysuru' },
  { quote: 'Their ghee is unmatched — you can genuinely taste the difference between this and packaged stuff.', name: 'Divya M., Mangaluru' },
];
 
export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
 
  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);
 
  const current = TESTIMONIALS[index];
 
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>What Our Families Say</Text>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.quote}>"{current.quote}"</Text>
        <Text style={styles.name}>— {current.name}</Text>
      </Animated.View>
      <View style={styles.dots}>
        {TESTIMONIALS.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrap: {
    margin: 20,
    padding: 24,
    backgroundColor: 'rgba(232,163,61,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(232,163,61,0.25)',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#E8A33D',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  quote: {
    color: '#fff',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 12,
  },
  name: {
    color: '#D97B3F',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: '#E8A33D',
  },
});