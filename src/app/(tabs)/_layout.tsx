import { Tabs } from 'expo-router';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { tabBarTranslateY } from '../utils/tabBarAnimation';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 36,
        borderRadius: 18,
        backgroundColor: focused ? 'rgba(57,211,83,0.15)' : 'transparent',
        overflow: 'visible',
      }}>
      <Text style={{ fontSize: 24, includeFontPadding: false, textAlignVertical: 'center' }}>
        {emoji}
      </Text>
    </View>
  );
}

const ICONS: Record<string, string> = {
  home: '🏠',
  cart: '🛒',
  orders: '📦',
  subscriptions: '🔄',
  account: '👤',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: '#0a0f1e',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        height: 72,
        paddingTop: 8,
        paddingBottom: 10,
        transform: [{ translateY: tabBarTranslateY }],
      }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
            <TabIcon emoji={ICONS[route.name]} focused={focused} />
            <Text
              style={{
                color: focused ? '#39d353' : 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: '600',
                marginTop: 2,
              }}>
              {options.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="subscriptions" options={{ title: 'Subscribe' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}