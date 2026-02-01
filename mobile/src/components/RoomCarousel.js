import React, { useMemo, useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

export default function RoomCarousel({ images }) {
  const [index, setIndex] = useState(0);

  const normalizedImages = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return ['https://via.placeholder.com/800x600?text=No+Image'];
    }
    return images.map((img) => (typeof img === 'string' ? img : img?.url || img?.secure_url || img?.path)).filter(Boolean);
  }, [images]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        scrollEventThrottle={16}
      >
        {normalizedImages.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={styles.image} />
        ))}
      </ScrollView>
      <View style={styles.counter}>
        <Text style={styles.counterText}>{Math.min(index + 1, normalizedImages.length)}/{normalizedImages.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width, height: 220 },
  image: { width, height: 220, resizeMode: 'cover' },
  counter: { position: 'absolute', bottom: 10, right: 20, backgroundColor: '#000a', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  counterText: { color: '#fff', fontWeight: 'bold' },
});
