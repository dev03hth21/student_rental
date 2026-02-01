import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../constants';
import { CreatePostProvider, useCreatePost } from '../../context/CreatePostContext';
import BasicInfoStep from './create-post/BasicInfoStep';
import MediaStep from './create-post/MediaStep';
import LocationStep from './create-post/LocationStep';
import { getHostRoomDetail } from '../../api/rooms';

const STEPS = ['Thông tin cơ bản', 'Hình ảnh', 'Địa chỉ & gửi duyệt'];

export default function OwnerCreateRoomScreen() {
  const route = useRoute();
  const editRoomId = route.params?.roomId;

  // Use key to force re-mount when roomId changes
  return (
    <CreatePostProvider key={editRoomId || 'new'}>
      <CreatePostFlow editRoomId={editRoomId} />
    </CreatePostProvider>
  );
}

function CreatePostFlow({ editRoomId }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(!!editRoomId);
  const [loadError, setLoadError] = useState(null);
  const navigation = useNavigation();
  const { data, setBasicInfo, setRoomId, setImages, setLocation, setMode } = useCreatePost();

  // Load existing room data when editing
  useEffect(() => {
    // Set mode based on whether we're editing or creating
    setMode(editRoomId ? 'edit' : 'create');

    if (!editRoomId) {
      setLoading(false);
      return;
    }

    const loadRoomData = async () => {
      setLoading(true);
      setLoadError(null);
      
      try {
        console.log('Loading room data for ID:', editRoomId);
        const room = await getHostRoomDetail(editRoomId);
        
        console.log('Loaded room:', room);
        
        if (room) {
          if (room.status && room.status !== 'draft') {
            const message = `Chỉ được chỉnh sửa tin nháp. Tin này đang ở trạng thái: ${room.status}.`;
            setLoadError(message);
            Alert.alert('Không thể chỉnh sửa', message, [
              {
                text: 'Đóng',
                onPress: () => navigation?.goBack?.(),
              },
            ]);
            return;
          }

          // Set room ID first
          setRoomId(room._id || room.id);
          
          // Set basic info
          setBasicInfo({
            roomId: room._id || room.id,
            type: room.type || '',
            title: room.title || '',
            description: room.description || '',
            price: room.price || '',
            area: room.area || '',
            address: room.address || '',
            contactPhone: room.contactPhone || '',
            postingPaid: Boolean(room.postingPaid),
          });

          // Set images
          if (room.images && room.images.length > 0) {
            setImages(room.images);
          }

          // Set location
          if (room.location?.lat && room.location?.lng) {
            setLocation({
              location: room.location,
              address: room.address || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading room:', error);
        setLoadError(error?.response?.data?.message || error?.message || 'Không thể tải thông tin tin đăng');
        Alert.alert('Lỗi', 'Không thể tải thông tin tin đăng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [editRoomId]);

  const completionMap = useMemo(
    () => ({
      0: Boolean(data.roomId),
      1: Array.isArray(data.images) && data.images.length >= 3,
      2: Boolean(data.location),
    }),
    [data]
  );

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));
  const resetFlow = () => setStepIndex(0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin tin đăng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStep = () => {
    if (stepIndex === 0) {
      return <BasicInfoStep onNext={goNext} />;
    }
    if (stepIndex === 1) {
      return <MediaStep onNext={goNext} onBack={goBack} />;
    }
    return <LocationStep onBack={goBack} onReset={resetFlow} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.progressWrapper}>
        <StepProgress currentStep={stepIndex} completionMap={completionMap} />
      </View>
      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
}

function StepProgress({ currentStep, completionMap }) {
  return (
    <View style={styles.progressRow}>
      {STEPS.map((label, index) => {
        const isActive = index === currentStep;
        const isDone = completionMap[index];
        const showLine = index < STEPS.length - 1;
        return (
          <View key={label} style={styles.progressItem}>
            <View style={styles.progressConnector}>
              <View
                style={[
                  styles.progressCircle,
                  isDone && styles.progressCircleDone,
                  isActive && styles.progressCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.progressNumber,
                    (isDone || isActive) && styles.progressNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              {showLine && (
                <View
                  style={[
                    styles.progressLine,
                    completionMap[index] && completionMap[index + 1] && styles.progressLineActive,
                  ]}
                />
              )}
            </View>
            <Text style={[styles.progressLabel, (isDone || isActive) && styles.progressLabelActive]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
  },
  progressWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: spacing.sm,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 32,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  progressCircleActive: {
    borderColor: colors.primary,
  },
  progressCircleDone: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  progressNumber: {
    color: colors.textSecondary,
    fontWeight: fonts.weights.medium,
  },
  progressNumberActive: {
    color: colors.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressLabel: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: fonts.weights.semiBold,
  },
  content: {
    flex: 1,
  },
});
