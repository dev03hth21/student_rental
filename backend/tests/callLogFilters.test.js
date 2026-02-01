const mongoose = require('mongoose');
const controller = require('../controllers/callLogController');

const { buildCallLogQuery } = controller.__testables;

describe('buildCallLogQuery helper', () => {
  const hostId = new mongoose.Types.ObjectId();
  const roomId = new mongoose.Types.ObjectId();

  test('defaults to host scope', () => {
    const { query } = buildCallLogQuery({ hostId });
    expect(query).toMatchObject({ hostId });
  });

  test('applies unread filter', () => {
    const { query } = buildCallLogQuery({ hostId, filterType: 'unread' });
    expect(query).toMatchObject({ hostId, isRead: false });
  });

  test('requires room id when filtering by room', () => {
    const result = buildCallLogQuery({ hostId, filterType: 'by-room' });
    expect(result.error).toBe('ROOM_ID_REQUIRED');
  });

  test('rejects invalid room id', () => {
    const result = buildCallLogQuery({ hostId, roomId: 'invalid' });
    expect(result.error).toBe('INVALID_ROOM_ID');
  });

  test('accepts valid room id regardless of filter', () => {
    const { query } = buildCallLogQuery({ hostId, roomId: roomId.toString() });
    expect(query).toMatchObject({ hostId, roomId: roomId.toString() });
  });
});
