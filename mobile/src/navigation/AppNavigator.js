import React, { memo } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Debug
import ConnectionDebugScreen from '../screens/ConnectionDebugScreen';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordCodeScreen from '../screens/auth/ResetPasswordCodeScreen';
import HomeScreen from '../screens/home/HomeScreen';
import RoomDetailScreen from '../screens/home/RoomDetailScreenNew';
import SearchResultsScreen from '../screens/home/SearchResultsScreen';
import BookingRequestScreen from '../screens/home/BookingRequestScreen';
import DepositCheckoutScreen from '../screens/home/DepositCheckoutScreen';
import ReportIssueScreen from '../screens/home/ReportIssueScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import MapViewScreen from '../screens/home/MapViewScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BookingsScreen from '../screens/profile/BookingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import ContractsScreen from '../screens/profile/ContractsScreen';
import ReviewsScreen from '../screens/profile/ReviewsScreen';
import RefundRequestsScreen from '../screens/profile/RefundRequestsScreen';
import ViewHistoryScreen from '../screens/ViewHistoryScreen';
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import PostManagementScreen from '../screens/owner/PostManagementScreen';
import OwnerBookingsScreen from '../screens/owner/OwnerBookingsScreen';
import OwnerPayoutsScreen from '../screens/owner/OwnerPayoutsScreen';
import OwnerTenantsScreen from '../screens/owner/OwnerTenantsScreen';
import OwnerDisputesScreen from '../screens/owner/OwnerDisputesScreen';
import OwnerCreateRoomScreen from '../screens/owner/OwnerCreateRoomScreen';
import OwnerAccountScreen from '../screens/owner/OwnerAccountScreen';
import OwnerEditInfoScreen from '../screens/owner/OwnerEditInfoScreen';
import CallLogDetailScreen from '../screens/owner/CallLogDetailScreen';
import CustomerScreen from '../screens/owner/CustomerScreen';
import OwnerListingDetailScreen from '../screens/owner/OwnerListingDetailScreen';

// Constants
import { colors } from '../constants';
import { useAppContext } from '../context/AppContext';

const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const OwnerAccountStack = createNativeStackNavigator();
const OwnerCustomersStack = createNativeStackNavigator();
const OwnerListingsStack = createNativeStackNavigator();
const StudentTab = createBottomTabNavigator();
const OwnerTab = createBottomTabNavigator();

// Memoized to avoid unnecessary re-renders on tab changes
const TabIcon = memo(({ icon, color }) => <Text style={{ fontSize: 24, color }}>{icon}</Text>);

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{ title: 'Chi tiết phòng' }}
      />
      <HomeStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Kết quả tìm kiếm' }}
      />
      <HomeStack.Screen
        name="BookingRequest"
        component={BookingRequestScreen}
        options={{ title: 'Đặt lịch xem phòng' }}
      />
      <HomeStack.Screen
        name="DepositCheckout"
        component={DepositCheckoutScreen}
        options={{ title: 'Thanh toán đặt cọc' }}
      />
      <HomeStack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{ title: 'Báo cáo tin đăng' }}
      />
      <HomeStack.Screen
        name="MapViewScreen"
        component={MapViewScreen}
        options={{ title: 'Xem bản đồ' }}
      />
      <HomeStack.Screen
        name="ConnectionDebug"
        component={ConnectionDebugScreen}
        options={{ title: 'API Connection Debug' }}
      />
    </HomeStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: 'Lịch sử đặt phòng' }}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Thông báo' }}
      />
      <ProfileStack.Screen
        name="ViewHistory"
        component={ViewHistoryScreen}
        options={{ title: 'Đã xem' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Cài đặt' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Chỉnh sửa hồ sơ' }}
      />
      <ProfileStack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Hỗ trợ & phản hồi' }}
      />
      <ProfileStack.Screen
        name="Payments"
        component={PaymentHistoryScreen}
        options={{ title: 'Thanh toán & hoá đơn' }}
      />
      <ProfileStack.Screen
        name="Contracts"
        component={ContractsScreen}
        options={{ title: 'Hợp đồng thuê' }}
      />
      <ProfileStack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Đánh giá của tôi' }}
      />
      <ProfileStack.Screen
        name="RefundRequests"
        component={RefundRequestsScreen}
        options={{ title: 'Yêu cầu hoàn cọc' }}
      />
    </ProfileStack.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordCode" component={ResetPasswordCodeScreen} />
    </Stack.Navigator>
  );
}

// Main Tabs
function StudentTabsNavigator() {
  return (
    <StudentTab.Navigator
      lazy={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        freezeOnBlur: true,
        unmountOnBlur: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <StudentTab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Tìm kiếm',
          tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} />,
        }}
      />
      <StudentTab.Screen 
        name="FavoritesTab" 
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Yêu thích',
          tabBarIcon: ({ color }) => <TabIcon icon="❤️" color={color} />,
        }}
      />
      <StudentTab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </StudentTab.Navigator>
  );
}

function OwnerAccountStackNavigator() {
  return (
    <OwnerAccountStack.Navigator>
      <OwnerAccountStack.Screen
        name="OwnerAccountHome"
        component={OwnerAccountScreen}
        options={{ headerShown: false }}
      />
      <OwnerAccountStack.Screen
        name="OwnerEditInfo"
        component={OwnerEditInfoScreen}
        options={{ title: 'Chỉnh sửa thông tin' }}
      />
      <OwnerAccountStack.Screen
        name="OwnerPayoutsPanel"
        component={OwnerPayoutsScreen}
        options={{ title: 'Đối soát & thanh toán' }}
      />
      <OwnerAccountStack.Screen
        name="OwnerTenantsPanel"
        component={OwnerTenantsScreen}
        options={{ title: 'Người thuê & hợp đồng' }}
      />
      <OwnerAccountStack.Screen
        name="OwnerDisputesPanel"
        component={OwnerDisputesScreen}
        options={{ title: 'Tranh chấp & hỗ trợ' }}
      />
    </OwnerAccountStack.Navigator>
  );
}

function OwnerCustomersStackNavigator() {
  return (
    <OwnerCustomersStack.Navigator>
      <OwnerCustomersStack.Screen
        name="CallLogsList"
        component={CustomerScreen}
        options={{ headerShown: false }}
      />
      <OwnerCustomersStack.Screen
        name="CallLogDetail"
        component={CallLogDetailScreen}
        options={{ title: 'Chi tiết liên hệ' }}
      />
    </OwnerCustomersStack.Navigator>
  );
}

function OwnerListingsStackNavigator() {
  return (
    <OwnerListingsStack.Navigator>
      <OwnerListingsStack.Screen
        name="OwnerListingsHome"
        component={PostManagementScreen}
        options={{ headerShown: false }}
      />
      <OwnerListingsStack.Screen
        name="OwnerListingDetail"
        component={OwnerListingDetailScreen}
        options={{ title: 'Chi tiết tin đăng' }}
      />
    </OwnerListingsStack.Navigator>
  );
}

function OwnerTabsNavigator() {
  return (
    <OwnerTab.Navigator
      lazy={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        freezeOnBlur: true,
        unmountOnBlur: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <OwnerTab.Screen
        name="OwnerOverview"
        component={OwnerDashboardScreen}
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
        }}
      />
      <OwnerTab.Screen
        name="OwnerListings"
        component={OwnerListingsStackNavigator}
        options={{
          tabBarLabel: 'Tin đăng',
          tabBarIcon: ({ color }) => <TabIcon icon="🗂️" color={color} />,
        }}
      />
      <OwnerTab.Screen
        name="OwnerCreate"
        component={OwnerCreateRoomScreen}
        options={{
          tabBarLabel: 'Đăng tin',
          tabBarIcon: ({ color }) => <TabIcon icon="➕" color={color} />,
        }}
      />
      <OwnerTab.Screen
        name="OwnerCustomers"
        component={OwnerCustomersStackNavigator}
        options={{
          tabBarLabel: 'Khách hàng',
          tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
        }}
      />
      <OwnerTab.Screen
        name="OwnerAccount"
        component={OwnerAccountStackNavigator}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </OwnerTab.Navigator>
  );
}

function MainTabs() {
  const { state } = useAppContext();
  return state.isOwnerMode ? <OwnerTabsNavigator /> : <StudentTabsNavigator />;
}

// Tab Icon Component
// Root Navigator
export default function AppNavigator() {
  const { state } = useAppContext();
  const isAuthenticated = state.isAuthenticated;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
