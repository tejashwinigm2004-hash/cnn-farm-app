import { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
 
export default function Marquee({ text = '', duration = 12000 }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const itemWidth = useRef(0);
 
  const loop = () => {
    translateX.setValue(0);
    Animated.timing(translateX, {
      toValue: -itemWidth.current,
      duration,
      useNativeDriver: true,
    }).start(() => loop());
  };
 
  const onLayout = (e) => {
    if (itemWidth.current === 0) {
      itemWidth.current = e.nativeEvent.layout.width;
      loop();
    }
  };
 
  return (
    <View style={styles.band}>
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        <Text style={styles.text} onLayout={onLayout}>
          {text}
        </Text>
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  band: {
    backgroundColor: 'rgba(232,163,61,0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(232,163,61,0.25)',
    paddingVertical: 10,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  text: {
    color: '#E8A33D',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    paddingRight: 40,
  },
});