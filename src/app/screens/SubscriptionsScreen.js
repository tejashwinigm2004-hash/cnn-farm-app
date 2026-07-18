import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// NOTE: No subscription API endpoints were found in the current backend/services yet
// (per the dev plan, subscriptions are a later-phase feature). This screen is a
// working placeholder UI so the tab is functional now — wire it up to real data
// once /api/subscriptions endpoints exist.
export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const s = getStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Subscriptions</Text>

      <View style={s.emptyCard}>
        <Text style={s.emptyIcon}>🔄</Text>
        <Text style={s.emptyTitle}>No active subscriptions</Text>
        <Text style={s.emptyText}>
          Set up a daily, weekly, or monthly delivery plan for your favorite dairy products.
        </Text>
        <TouchableOpacity style={s.browseButton} onPress={() => router.push('/products')}>
          <Text style={s.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingTop: 50,
      paddingBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    emptyCard: {
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textFaint,
      textAlign: 'center',
      marginBottom: 20,
    },
    browseButton: {
      backgroundColor: 'rgba(57,211,83,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(57,211,83,0.35)',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    browseButtonText: {
      color: '#1a9e46',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });
}