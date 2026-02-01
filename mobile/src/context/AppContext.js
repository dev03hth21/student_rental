import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rooms as initialRooms } from '../data/rooms';
import api, { setAuthToken } from '../services/api';
import { testConnection } from '../services/connectionTest';
import { getMyFavorites, addFavorite, removeFavoriteByRoom } from '../api/favorites';
import { recordView } from '../api/viewlogs';

const AppContext = createContext(null);

const normalizeRoomPayload = (room) => {
  if (!room) return null;

  const images = Array.isArray(room.images)
    ? room.images
        .map((image) => {
          if (typeof image === 'string') return image;
          return image?.url || image?.secure_url || image?.secureUrl || image?.path;
        })
        .filter(Boolean)
    : [];

  const normalizedLocation = room.location?.latitude
    ? room.location
    : Array.isArray(room.location?.coordinates) && room.location.coordinates.length === 2
      ? {
          latitude: room.location.coordinates[1],
          longitude: room.location.coordinates[0],
        }
      : null;

  return {
    ...room,
    id: room.id || room._id || room.slug,
    images,
    location: normalizedLocation,
  };
};

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authTokens, setAuthTokens] = useState(null);
  const [rooms, setRooms] = useState(initialRooms);
  const [favoriteRoomIds, setFavoriteRoomIds] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [roomStats, setRoomStats] = useState(null);
  const [bookingRequests, setBookingRequests] = useState([]);
  const canUseOwnerMode = ['owner', 'admin'].includes(user?.role);
  const activeRole = canUseOwnerMode ? 'owner' : 'student';
  const isOwnerMode = activeRole === 'owner';
  const AUTH_STORAGE_KEY = 'srp_auth_state';

  const persistAuth = async (payload) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Persist auth failed', err?.message);
    }
  };

  const clearPersistedAuth = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('Clear auth failed', err?.message);
    }
  };

  const syncFavorites = useCallback(async () => {
    if (isOwnerMode) return; // owners do not use favorites; avoid 403
    try {
      const favorites = await getMyFavorites();
      const ids = favorites
        .map((fav) => fav.room?._id || fav.roomId || fav._id)
        .filter(Boolean);
      setFavoriteRoomIds(ids);

      // Merge favorite rooms into the rooms list if missing (ensures persistence after relogin)
      const favoriteRooms = favorites
        .map((fav) => normalizeRoomPayload(fav.room))
        .filter(Boolean);

      if (favoriteRooms.length) {
        setRooms((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          favoriteRooms.forEach((room) => {
            if (!existingIds.has(room.id)) {
              merged.push(room);
            }
          });
          return merged;
        });
      }
    } catch (err) {
      console.warn('Sync favorites failed', err?.message);
    }
  }, [isOwnerMode]);

  const authenticate = async ({ user: userPayload, tokens }) => {
    if (!userPayload || !tokens) {
      throw new Error('Thiếu dữ liệu đăng nhập hợp lệ');
    }

    setUser(userPayload);
    setAuthTokens(tokens);
    setIsAuthenticated(true);

    if (tokens?.accessToken) {
      setAuthToken(tokens.accessToken);
      await persistAuth({ user: userPayload, tokens });
      if (!['owner', 'admin'].includes(userPayload?.role)) {
        await syncFavorites();
      }
    }
  };

  const loginDemo = ({ email = 'demo@student.com', role = 'student' }) => {
    setUser({
      id: 'mock-user',
      name: role === 'owner' ? 'Chủ trọ Demo' : 'Sinh viên Demo',
      fullName: role === 'owner' ? 'Chủ trọ Demo' : 'Sinh viên Demo',
      email,
      role,
      phone: '0123456789',
    });
    setAuthTokens(null);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAuthTokens(null);
    setAuthToken(null); // Clear token from API
    clearPersistedAuth();
  };

  const updateUserProfile = async (partialProfile = {}) => {
    setUser((prev) => ({
      ...(prev || {}),
      ...partialProfile,
      id: partialProfile.id || prev?.id,
    }));

    const next = {
      user: { ...(user || {}), ...partialProfile },
      tokens: authTokens,
    };
    await persistAuth(next);
  };


  const toggleFavorite = async (roomId) => {
    if (!roomId) return;
    if (isOwnerMode) return; // owners do not toggle favorites

    const already = favoriteRoomIds.includes(roomId);
    setFavoriteRoomIds((prev) =>
      already ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );

    if (!isAuthenticated) return; // local-only when not logged in

    try {
      if (already) {
        await removeFavoriteByRoom(roomId);
      } else {
        await addFavorite(roomId);
      }
      await syncFavorites();
    } catch (err) {
      console.warn('Toggle favorite failed', err?.message);
    }
  };

  const markRoomAsViewed = async (roomId) => {
    setRecentRooms((prev) => {
      const filtered = prev.filter((id) => id !== roomId);
      return [roomId, ...filtered].slice(0, 10);
    });

    if (!roomId || !isAuthenticated) return;
    try {
      await recordView(roomId);
    } catch (err) {
      console.warn('Record view failed', err?.message);
    }
  };

  const createBookingRequest = (payload) => {
    const request = {
      id: `booking-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...payload,
    };
    setBookingRequests((prev) => [request, ...prev]);
    return request;
  };

  const fetchRooms = useCallback(async (params = {}) => {
    setRoomsLoading(true);
    setRoomsError(null);

    try {
      const response = await api.get('/rooms', {
        params: {
          limit: params.limit || 100,
          ...params,
        },
      });

      const payload = response.data?.data;
      const normalizedRooms = (payload?.rooms || payload || [])
        .map(normalizeRoomPayload)
        .filter(Boolean);

      setRooms(normalizedRooms);

      if (payload?.stats) {
        setRoomStats(payload.stats);
      } else {
        const avgPrice = normalizedRooms.length
          ? normalizedRooms.reduce((acc, room) => acc + (room.price || 0), 0) /
            normalizedRooms.length
          : 0;
        setRoomStats({
          total: normalizedRooms.length,
          avgPrice,
        });
      }

      return normalizedRooms;
    } catch (error) {
      console.error('❌ Failed to fetch rooms', error?.message || error);
      
      // Test connection to provide better error message
      const testResult = await testConnection();
      if (!testResult.success) {
        console.error('💡 Connection test failed:', testResult.message);
        setRoomsError(testResult.message);
      } else {
        setRoomsError(error?.message || 'Không thể tải danh sách phòng');
      }

      if (!rooms.length) {
        setRooms(initialRooms);
      }

      return [];
    } finally {
      setRoomsLoading(false);
    }
  }, [rooms.length]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.tokens?.accessToken) {
          setAuthToken(parsed.tokens.accessToken);
          setUser(parsed.user);
          setAuthTokens(parsed.tokens);
          setIsAuthenticated(true);
          if (!['owner', 'admin'].includes(parsed?.user?.role)) {
            await syncFavorites();
          }
        }
      } catch (err) {
        console.warn('Restore auth failed', err?.message);
      }
    };

    bootstrapAuth();
  }, [syncFavorites]);

  const favoriteRooms = useMemo(
    () => rooms.filter((room) => favoriteRoomIds.includes(room.id)),
    [rooms, favoriteRoomIds]
  );

  const recentRoomItems = useMemo(
    () => recentRooms.map((id) => rooms.find((room) => room.id === id)).filter(Boolean),
    [recentRooms, rooms]
  );

  useEffect(() => {
    const token = authTokens?.accessToken;
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [authTokens]);

  const value = {
    state: {
      isAuthenticated,
      user,
      authTokens,
      rooms,
      favoriteRoomIds,
      favoriteRooms,
      recentRoomItems,
      bookingRequests,
      roomsLoading,
      roomsError,
      roomStats,
      activeRole,
      isOwnerMode,
      canUseOwnerMode,
    },
    actions: {
      authenticate,
      loginDemo,
      logout,
      updateUserProfile,
      toggleFavorite,
      markRoomAsViewed,
      setRooms,
      fetchRooms,
      createBookingRequest,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
