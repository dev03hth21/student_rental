import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { searchRooms, addFavorite, removeFavorite } from '../api/room';

export default function TestScreen() {
  useEffect(() => {
    async function runTests() {
      try {
        const rooms = await searchRooms({ keyword: 'vinhomes', sort: 'price_asc' });
        console.log('SearchRooms:', rooms);
        if (rooms.length > 0) {
          const roomId = rooms[0]._id;
          const addRes = await addFavorite(roomId);
          console.log('addFavorite:', addRes);
          const removeRes = await removeFavorite(roomId);
          console.log('removeFavorite:', removeRes);
        }
      } catch (err) {
        console.error('Test error:', err);
      }
    }
    runTests();
  }, []);
  return <View><Text>TestScreen: Check logs for results</Text></View>;
}
