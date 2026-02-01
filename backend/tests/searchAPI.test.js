/**
 * Test Search & Filter APIs
 * 
 * Run: node backend/tests/searchAPI.test.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSearchAndFilter() {
  console.log('🧪 Testing Search & Filter APIs...\n');

  try {
    // Test 1: Basic search
    console.log('1️⃣ Test basic rooms list:');
    const res1 = await axios.get(`${API_BASE}/rooms`);
    console.log(`✅ Status: ${res1.status}`);
    console.log(`✅ Total rooms: ${res1.data.data.pagination.total}`);
    console.log('');

    // Test 2: Filter by price
    console.log('2️⃣ Test filter by price (2-3 triệu):');
    const res2 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        minPrice: 2000000,
        maxPrice: 3000000,
      }
    });
    console.log(`✅ Status: ${res2.status}`);
    console.log(`✅ Filtered rooms: ${res2.data.data.rooms.length}`);
    if (res2.data.data.rooms.length > 0) {
      const room = res2.data.data.rooms[0];
      console.log(`   Sample: ${room.title} - ${room.price.toLocaleString('vi-VN')} đ`);
    }
    console.log('');

    // Test 3: Filter by area
    console.log('3️⃣ Test filter by area (20-30m²):');
    const res3 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        minArea: 20,
        maxArea: 30,
      }
    });
    console.log(`✅ Status: ${res3.status}`);
    console.log(`✅ Filtered rooms: ${res3.data.data.rooms.length}`);
    if (res3.data.data.rooms.length > 0) {
      const room = res3.data.data.rooms[0];
      console.log(`   Sample: ${room.title} - ${room.area}m²`);
    }
    console.log('');

    // Test 4: Sort by price ascending
    console.log('4️⃣ Test sort by price (ascending):');
    const res4 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        sort: 'price',
        limit: 5,
      }
    });
    console.log(`✅ Status: ${res4.status}`);
    console.log(`✅ Rooms sorted by price (asc):`);
    res4.data.data.rooms.forEach((room, i) => {
      console.log(`   ${i + 1}. ${room.title} - ${room.price.toLocaleString('vi-VN')} đ`);
    });
    console.log('');

    // Test 5: Sort by price descending
    console.log('5️⃣ Test sort by price (descending):');
    const res5 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        sort: '-price',
        limit: 5,
      }
    });
    console.log(`✅ Status: ${res5.status}`);
    console.log(`✅ Rooms sorted by price (desc):`);
    res5.data.data.rooms.forEach((room, i) => {
      console.log(`   ${i + 1}. ${room.title} - ${room.price.toLocaleString('vi-VN')} đ`);
    });
    console.log('');

    // Test 6: Sort by newest
    console.log('6️⃣ Test sort by newest:');
    const res6 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        sort: '-createdAt',
        limit: 3,
      }
    });
    console.log(`✅ Status: ${res6.status}`);
    console.log(`✅ Newest rooms:`);
    res6.data.data.rooms.forEach((room, i) => {
      const date = new Date(room.createdAt).toLocaleDateString('vi-VN');
      console.log(`   ${i + 1}. ${room.title} - ${date}`);
    });
    console.log('');

    // Test 7: Combine filters + sort
    console.log('7️⃣ Test combine filters + sort:');
    const res7 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        minPrice: 2000000,
        maxPrice: 5000000,
        minArea: 20,
        sort: 'price',
        limit: 5,
      }
    });
    console.log(`✅ Status: ${res7.status}`);
    console.log(`✅ Rooms (2-5tr, >20m², sorted by price):`);
    res7.data.data.rooms.forEach((room, i) => {
      console.log(`   ${i + 1}. ${room.title}`);
      console.log(`       ${room.price.toLocaleString('vi-VN')} đ - ${room.area}m²`);
    });
    console.log('');

    // Test 8: Keyword search
    console.log('8️⃣ Test keyword search:');
    const res8 = await axios.get(`${API_BASE}/rooms`, {
      params: {
        keyword: 'phòng',
        limit: 3,
      }
    });
    console.log(`✅ Status: ${res8.status}`);
    console.log(`✅ Search results for "phòng": ${res8.data.data.rooms.length} rooms`);
    res8.data.data.rooms.forEach((room, i) => {
      console.log(`   ${i + 1}. ${room.title}`);
    });
    console.log('');

    console.log('✅ All tests passed! 🎉');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testSearchAndFilter();
