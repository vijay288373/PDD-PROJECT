import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../lib/AuthContext';
import { t } from '../lib/i18n';
import { useLang } from '../lib/useLang';

// Icons
import { Leaf, Cloud, TrendingUp, User, Sprout, FlaskConical } from 'lucide-react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import PlantScanScreen from '../screens/PlantScanScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import AlertsCenterScreen from '../screens/AlertsCenterScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import CropSelectionScreen from '../screens/CropSelectionScreen';
import CropGrowthAdvisorScreen from '../screens/CropGrowthAdvisorScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { langCode } = useLang();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 10,
          right: 10,
          backgroundColor: 'rgba(5, 46, 22, 0.95)',
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: 'rgba(74, 222, 128, 0.25)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let IconComponent;
          if (route.name === 'Scan') IconComponent = Leaf;
          else if (route.name === 'Crops') IconComponent = Sprout;
          else if (route.name === 'Grow') IconComponent = FlaskConical;
          else if (route.name === 'Weather') IconComponent = Cloud;
          else if (route.name === 'Market') IconComponent = TrendingUp;
          else if (route.name === 'Profile') IconComponent = User;

          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <IconComponent color={focused ? '#22c55e' : color} size={focused ? size + 1 : size} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Crops"
        component={CropSelectionScreen}
        options={{ title: 'Crops' }}
      />
      <Tab.Screen
        name="Grow"
        component={CropGrowthAdvisorScreen}
        options={{ title: 'Grow' }}
      />
      <Tab.Screen
        name="Weather"
        component={WeatherScreen}
        options={{ title: t('tab_weather', 'en') || 'Weather' }}
      />
      <Tab.Screen
        name="Market"
        component={MarketPricesScreen}
        options={{ title: t('tab_market', 'en') || 'Market' }}
      />
      <Tab.Screen
        name="Scan"
        component={PlantScanScreen}
        options={{ title: t('tab_scan', 'en') || 'Scan' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileSettingsScreen}
        options={{ title: t('tab_profile', 'en') || 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#052e16',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  }
});
