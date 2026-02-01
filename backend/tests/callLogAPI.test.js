const mongoose = require('mongoose');
const { buildCallLogQuery, buildRoomStats } = require('../controllers/callLogController').__testables;

describe('CallLog Business Logic Tests', () => {
  let ownerId;
  let roomId;
  let studentId;

  beforeAll(() => {
    // Create test IDs
    ownerId = new mongoose.Types.ObjectId();
    studentId = new mongoose.Types.ObjectId();
    roomId = new mongoose.Types.ObjectId();
  });

  describe('buildCallLogQuery function', () => {
    it('should build query for all logs', () => {
      const result = buildCallLogQuery({ hostId: ownerId, filterType: 'all' });
      expect(result.query).toEqual({ hostId: ownerId });
      expect(result.normalizedFilter).toBe('all');
    });

    it('should build query for unread logs', () => {
      const result = buildCallLogQuery({ hostId: ownerId, filterType: 'unread' });
      expect(result.query).toEqual({ hostId: ownerId, isRead: false });
      expect(result.normalizedFilter).toBe('unread');
    });

    it('should build query for specific room', () => {
      const result = buildCallLogQuery({
        hostId: ownerId,
        filterType: 'by-room',
        roomId: roomId.toString(),
      });
      expect(result.query).toEqual({ hostId: ownerId, roomId: roomId.toString() });
      expect(result.normalizedFilter).toBe('by-room');
    });

    it('should return error for invalid room ID', () => {
      const result = buildCallLogQuery({
        hostId: ownerId,
        filterType: 'by-room',
        roomId: 'invalid-id',
      });
      expect(result.error).toBe('INVALID_ROOM_ID');
    });

    it('should return error for by-room filter without roomId', () => {
      const result = buildCallLogQuery({ hostId: ownerId, filterType: 'by-room' });
      expect(result.error).toBe('ROOM_ID_REQUIRED');
    });

    it('should handle uppercase filter types', () => {
      const result = buildCallLogQuery({ hostId: ownerId, filterType: 'UNREAD' });
      expect(result.query).toEqual({ hostId: ownerId, isRead: false });
      expect(result.normalizedFilter).toBe('unread');
    });
  });

  describe('buildRoomStats function', () => {
    it('should build stats for empty logs', () => {
      const stats = buildRoomStats([]);
      expect(stats.size).toBe(0);
    });

    it('should count total and unread calls per room', () => {
      const room1Id = new mongoose.Types.ObjectId();
      const room2Id = new mongoose.Types.ObjectId();

      const mockLogs = [
        { roomId: { _id: room1Id, title: 'Room 1' }, isRead: false },
        { roomId: { _id: room1Id, title: 'Room 1' }, isRead: true },
        { roomId: { _id: room1Id, title: 'Room 1' }, isRead: false },
        { roomId: { _id: room2Id, title: 'Room 2' }, isRead: false },
      ];

      const stats = buildRoomStats(mockLogs);
      
      const room1Stats = stats.get(room1Id.toString());
      expect(room1Stats.total).toBe(3);
      expect(room1Stats.unread).toBe(2);
      expect(room1Stats.title).toBe('Room 1');

      const room2Stats = stats.get(room2Id.toString());
      expect(room2Stats.total).toBe(1);
      expect(room2Stats.unread).toBe(1);
    });

    it('should handle deleted rooms', () => {
      const mockLogs = [
        { roomId: null, isRead: false },
        { roomId: { title: null }, isRead: false },
      ];

      const stats = buildRoomStats(mockLogs);
      const unknownStats = stats.get('unknown');
      
      expect(unknownStats.total).toBe(2);
      expect(unknownStats.unread).toBe(2);
      expect(unknownStats.title).toBe('Tin đã xóa');
    });
  });
});
