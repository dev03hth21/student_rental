const mongoose = require('mongoose');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const ResponseHandler = require('../utils/responseHandler');
const asyncHandler = require('../utils/asyncHandler');

const PUBLIC_STATUSES = ['approved', 'available'];
const ADMIN_STATUSES = ['pending', 'approved', 'rejected', 'needs_changes'];
const OWNER_STATUS_UPDATES = ['available', 'rented'];
const MIN_DESCRIPTION_LENGTH = 20;
const MIN_AREA_SIZE = 5;
const MIN_REQUIRED_IMAGES = 3;
const MAX_IMAGE_COUNT = 10;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const EXPIRING_THRESHOLD_DAYS = 23;
const EXPIRED_THRESHOLD_DAYS = 30;

const HOST_STATUS_FILTERS = new Set(['draft', 'pending', 'approved', 'rejected', 'needs_changes', 'available', 'rented', 'reserved']);
const DERIVED_STATUS_FILTERS = new Set(['expired', 'expiring']);

const pick = (payload = {}, fields = []) =>
  fields.reduce((acc, key) => {
    if (payload[key] !== undefined) {
      acc[key] = payload[key];
    }
    return acc;
  }, {});

const normalizeImages = (images = []) => {
  const cleaned = images
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return Array.from(new Set(cleaned)).slice(0, MAX_IMAGE_COUNT);
};

const toCoordinateNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const normalizeLocation = (location = {}) => {
  const lat = toCoordinateNumber(location.lat);
  const lng = toCoordinateNumber(location.lng);

  if (lat === null || lng === null) {
    return null;
  }

  return { 
    lat, 
    lng,
    type: 'Point',
    coordinates: [lng, lat] // GeoJSON: [longitude, latitude]
  };
};

const normalizeContactPhone = (value, fallback) => {
  const primary = typeof value === 'string' ? value.trim() : '';
  if (primary) {
    return primary;
  }

  const secondary = typeof fallback === 'string' ? fallback.trim() : '';
  return secondary || null;
};

const coerceNumber = (value) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const normalized = value.replace(/\./g, '').replace(/,/g, '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

const validateStepOneFields = ({ title, description, price, area, type }) => {
  if (!type || !type.trim()) {
    return 'Vui lòng chọn loại bất động sản';
  }

  if (!title || !title.trim()) {
    return 'Tiêu đề không được để trống';
  }

  if (!description || description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return `Mô tả phải có ít nhất ${MIN_DESCRIPTION_LENGTH} ký tự`;
  }

  if (!Number.isFinite(price) || price <= 0) {
    return 'Giá phòng phải là số lớn hơn 0';
  }

  if (!Number.isFinite(area) || area <= MIN_AREA_SIZE) {
    return 'Diện tích phải lớn hơn 5m²';
  }

  return null;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If already a full URL (Cloudinary, etc), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Add base URL for local uploads
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}${imagePath}`;
};

const serializeRoom = (room, derivedStatus = null) => {
  const images = (room.images || []).map(getImageUrl);
  
  // Extract coordinates for frontend compatibility
  const coordinates = room.location ? {
    lat: room.location.lat,
    lng: room.location.lng
  } : null;
  
  return {
    _id: room._id.toString(),
    id: room._id.toString(),
    ownerId: room.ownerId?.toString(),
    type: room.type || 'other',
    title: room.title,
    description: room.description,
    price: room.price,
    area: room.area,
    address: room.address,
    images,
    thumbnail: images.length ? images[0] : null,
    location: room.location,
    coordinates, // Add for map view compatibility
    status: room.status,
    derivedStatus: derivedStatus || null,
    callCount: room.callCount,
    contactPhone: room.contactPhone,
    adminNote: room.adminNote,
    approvedAt: room.approvedAt,
    rejectedAt: room.rejectedAt,
    approvedBy: room.approvedBy,
    rejectedBy: room.rejectedBy,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getDerivedRoomStatus = (room) => {
  if (!room?.updatedAt || room.status !== 'available') {
    return null;
  }

  const updatedAt = room.updatedAt instanceof Date ? room.updatedAt : new Date(room.updatedAt);
  const diffDays = (Date.now() - updatedAt.getTime()) / DAY_IN_MS;

  if (diffDays >= EXPIRED_THRESHOLD_DAYS) {
    return 'expired';
  }

  if (diffDays >= EXPIRING_THRESHOLD_DAYS) {
    return 'expiring';
  }

  return null;
};

const buildPublicFilters = (query = {}) => {
  const filters = {
    status: { $in: PUBLIC_STATUSES },
  };

  if (query.keyword) {
    const regex = new RegExp(query.keyword.trim(), 'i');
    filters.$or = [{ title: regex }, { description: regex }, { address: regex }];
  }

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filters.price = {};
    if (Number.isFinite(minPrice)) {
      filters.price.$gte = Math.max(minPrice, 0);
    }
    if (Number.isFinite(maxPrice)) {
      filters.price.$lte = Math.max(maxPrice, 0);
    }
  }

  // Area filter
  const minArea = Number(query.minArea);
  const maxArea = Number(query.maxArea);

  if (Number.isFinite(minArea) || Number.isFinite(maxArea)) {
    filters.area = {};
    if (Number.isFinite(minArea)) {
      filters.area.$gte = Math.max(minArea, 0);
    }
    if (Number.isFinite(maxArea)) {
      filters.area.$lte = Math.max(maxArea, 0);
    }
  }

  // Geo-location filter (radius search)
  // Example: ?lat=10.7769&lng=106.7009&radius=5 (km)
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  const radius = Number(query.radius) || 5; // Default 5km

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    // Convert radius from km to radians (Earth radius = 6371 km)
    const radiusInRadians = radius / 6371;
    
    filters['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians]
      }
    };
  }

  if (query.status) {
    const statuses = query.status
      .split(',')
      .map((item) => item.trim())
      .filter((item) => PUBLIC_STATUSES.includes(item));
    if (statuses.length) {
      filters.status = { $in: statuses };
    }
  }

  // Filter by owner
  if (query.ownerId && mongoose.isValidObjectId(query.ownerId)) {
    filters.ownerId = query.ownerId;
  }

  return filters;
};

const listPublicRooms = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filters = buildPublicFilters(req.query);
  
  // Dynamic sort
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') 
      ? req.query.sort.substring(1) 
      : req.query.sort;
    const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
    
    // Allow sorting by: price, area, createdAt
    if (['price', 'area', 'createdAt'].includes(sortField)) {
      sortOption = { [sortField]: sortOrder };
    }
  }

  const [rooms, total] = await Promise.all([
    Room.find(filters).sort(sortOption).skip(skip).limit(limit),
    Room.countDocuments(filters),
  ]);

  const serializedRooms = rooms.map(serializeRoom);

  return res.status(200).json({
    success: true,
    message: 'Lấy danh sách phòng thành công',
    data: serializedRooms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const getPublicRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  // Tìm trước, sau đó kiểm tra trạng thái để trả thông báo thân thiện
  const room = await Room.findById(id);

  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  if (!PUBLIC_STATUSES.includes(room.status)) {
    return ResponseHandler.notFound(res, 'Phòng đang chờ duyệt hoặc tạm ẩn, không thể hiển thị');
  }

  return ResponseHandler.success(res, 'Lấy chi tiết phòng thành công', serializeRoom(room));
});

const ensureLocation = (location) => {
  const normalized = normalizeLocation(location);
  if (!normalized) {
    throw new Error('location.lat và location.lng là bắt buộc và phải là số');
  }
  return normalized;
};

const getLocationFromPayload = (payload = {}) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Thiếu dữ liệu vị trí');
  }

  if (payload.location) {
    return ensureLocation(payload.location);
  }

  if (payload.lat !== undefined && payload.lng !== undefined) {
    return ensureLocation({ lat: payload.lat, lng: payload.lng });
  }

  throw new Error('Cần cung cấp location.lat và location.lng');
};

const createRoom = asyncHandler(async (req, res) => {
  const payload = pick(req.body, [
    'type',
    'title',
    'description',
    'price',
    'address',
    'images',
    'location',
    'area',
    'contactPhone',
  ]);
  const normalizedPrice = coerceNumber(payload.price);
  const normalizedArea = coerceNumber(payload.area);
  const validationError = validateStepOneFields({
    type: payload.type,
    title: payload.title,
    description: payload.description,
    price: normalizedPrice,
    area: normalizedArea,
  });

  if (validationError) {
    return ResponseHandler.badRequest(res, validationError);
  }

  const title = payload.title.trim();
  const description = payload.description.trim();
  const address = payload.address?.trim();
  const type = payload.type.trim();

  if (!address) {
    return ResponseHandler.badRequest(res, 'Địa chỉ là bắt buộc');
  }

  let location;
  if (payload.location) {
    try {
      location = ensureLocation(payload.location);
    } catch (error) {
      return ResponseHandler.badRequest(res, error.message);
    }
  }

  const roomPayload = {
    ownerId: req.user._id,
    type,
    title,
    description,
    price: normalizedPrice,
    area: normalizedArea,
    address,
    images: normalizeImages(payload.images),
    status: 'draft',
    callCount: 0,
  };

  const contactPhone = normalizeContactPhone(payload.contactPhone, req.user.phone);
  if (!contactPhone) {
    return ResponseHandler.badRequest(res, 'Số điện thoại liên hệ là bắt buộc');
  }

  roomPayload.contactPhone = contactPhone;

  if (location) {
    roomPayload.location = location;
  }

  const room = await Room.create(roomPayload);

  return ResponseHandler.created(res, 'Tạo tin nháp thành công', {
    room: serializeRoom(room),
  });
});

const getHostRooms = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const normalizedStatus = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : 'all';
  const searchTerm = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const baseFilter = { ownerId };
  const isDerivedFilter = DERIVED_STATUS_FILTERS.has(normalizedStatus);

  if (!isDerivedFilter && normalizedStatus !== 'all' && HOST_STATUS_FILTERS.has(normalizedStatus)) {
    baseFilter.status = normalizedStatus;
  }

  if (searchTerm) {
    baseFilter.title = { $regex: escapeRegex(searchTerm), $options: 'i' };
  }

  const rooms = await Room.find(baseFilter).sort({ updatedAt: -1 });

  const decorated = rooms.map((room) => ({ room, derivedStatus: getDerivedRoomStatus(room) }));

  const filteredRooms = isDerivedFilter
    ? decorated.filter((entry) => entry.derivedStatus === normalizedStatus)
    : decorated;

  return ResponseHandler.success(res, 'Lấy danh sách phòng của bạn thành công', {
    rooms: filteredRooms.map(({ room, derivedStatus }) => serializeRoom(room, derivedStatus)),
  });
});

const getHostRoomDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  return ResponseHandler.success(res, 'Lấy chi tiết phòng thành công', {
    room: serializeRoom(room),
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  const updates = pick(req.body, ['type', 'title', 'description', 'price', 'address', 'images', 'area', 'contactPhone']);

  const isDraft = room.status === 'draft';
  const wantsContentChange =
    updates.type !== undefined ||
    updates.title !== undefined ||
    updates.description !== undefined ||
    updates.price !== undefined ||
    updates.address !== undefined ||
    updates.images !== undefined ||
    updates.area !== undefined ||
    updates.contactPhone !== undefined ||
    req.body.location !== undefined;

  // Nếu không phải draft, chỉ cho phép đổi trạng thái (available/rented), không sửa nội dung
  if (!isDraft && wantsContentChange) {
    return ResponseHandler.badRequest(res, 'Chỉ được chỉnh sửa nội dung khi tin đang ở trạng thái nháp');
  }

  if (updates.type !== undefined) {
    const trimmedType = typeof updates.type === 'string' ? updates.type.trim() : '';
    if (!trimmedType) {
      return ResponseHandler.badRequest(res, 'Loại phòng không được để trống');
    }
    updates.type = trimmedType;
  }

  if (updates.price !== undefined) {
    const nextPrice = coerceNumber(updates.price);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      return ResponseHandler.badRequest(res, 'Giá phòng phải là số lớn hơn 0');
    }
    updates.price = nextPrice;
  }

  if (updates.area !== undefined) {
    const nextArea = coerceNumber(updates.area);
    if (!Number.isFinite(nextArea) || nextArea <= MIN_AREA_SIZE) {
      return ResponseHandler.badRequest(res, 'Diện tích phải lớn hơn 5m²');
    }
    updates.area = nextArea;
  }

  if (req.body.location) {
    try {
      updates.location = ensureLocation(req.body.location);
    } catch (error) {
      return ResponseHandler.badRequest(res, error.message);
    }
  }

  if (req.body.images) {
    updates.images = normalizeImages(req.body.images);
  }

  if (updates.contactPhone !== undefined) {
    const nextContact = normalizeContactPhone(updates.contactPhone, room.contactPhone || req.user.phone);
    if (!nextContact) {
      return ResponseHandler.badRequest(res, 'Số điện thoại liên hệ là bắt buộc');
    }
    updates.contactPhone = nextContact;
  }

  if (req.body.status) {
    const desiredStatus = req.body.status;
    if (!OWNER_STATUS_UPDATES.includes(desiredStatus)) {
      return ResponseHandler.badRequest(res, 'Chỉ được đặt trạng thái available hoặc rented');
    }
    updates.status = desiredStatus;
  }

  Object.assign(room, updates);
  await room.save();

  return ResponseHandler.success(res, 'Cập nhật phòng thành công', {
    room: serializeRoom(room),
  });
});

const { uploadImage } = require('../services/cloudinaryService');

const uploadRoomImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  if (room.status !== 'draft') {
    return ResponseHandler.badRequest(res, 'Chỉ được chỉnh sửa tin khi đang ở trạng thái nháp');
  }

  const files = Array.isArray(req.files) ? req.files : [];
  if (!files.length) {
    return ResponseHandler.badRequest(res, 'Vui lòng chọn ít nhất 1 ảnh để tải lên');
  }

  const shouldReplace = String(req.body?.replace || '').toLowerCase() === 'true';
  const existing = Array.isArray(room.images) ? room.images : [];

  const uploaded = [];

  for (const file of files) {
    try {
      const result = await uploadImage({ buffer: file.buffer, folder: 'rooms' });
      if (result?.secure_url) {
        uploaded.push(result.secure_url);
      }
    } catch (error) {
      console.error('Cloud upload failed:', error.message);
    }
  }

  if (!uploaded.length) {
    return ResponseHandler.badRequest(res, 'Không có ảnh hợp lệ nào được tải lên');
  }

  room.images = shouldReplace
    ? uploaded.slice(0, MAX_IMAGE_COUNT)
    : normalizeImages([...existing, ...uploaded]);

  await room.save();

  return ResponseHandler.success(res, 'Tải ảnh thành công', {
    room: serializeRoom(room),
  });
});

const updateRoomLocationOnly = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  if (room.status !== 'draft') {
    return ResponseHandler.badRequest(res, 'Chỉ được chỉnh sửa tin khi đang ở trạng thái nháp');
  }

  let nextLocation;
  try {
    nextLocation = getLocationFromPayload(req.body);
  } catch (error) {
    return ResponseHandler.badRequest(res, error.message || 'Toạ độ không hợp lệ');
  }

  if (req.body.address !== undefined) {
    const trimmedAddress = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    if (!trimmedAddress) {
      return ResponseHandler.badRequest(res, 'Địa chỉ không được để trống');
    }
    room.address = trimmedAddress;
  }

  room.location = nextLocation;
  await room.save();

  return ResponseHandler.success(res, 'Cập nhật vị trí phòng thành công', {
    room: serializeRoom(room),
  });
});


const submitRoomForReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  if (room.status !== 'draft') {
    return ResponseHandler.badRequest(res, 'Chỉ có thể gửi duyệt với tin đang ở trạng thái nháp');
  }

  const validationError = validateStepOneFields({
    type: room.type,
    title: room.title,
    description: room.description,
    price: room.price,
    area: room.area,
  });

  if (validationError) {
    return ResponseHandler.badRequest(res, validationError);
  }

  if (!Array.isArray(room.images) || room.images.length < MIN_REQUIRED_IMAGES) {
    return ResponseHandler.badRequest(res, `Tin đăng cần tối thiểu ${MIN_REQUIRED_IMAGES} ảnh`);
  }

  if (!room.location || typeof room.location.lat !== 'number' || typeof room.location.lng !== 'number') {
    return ResponseHandler.badRequest(res, 'Vui lòng ghim tọa độ trên bản đồ trước khi gửi duyệt');
  }

  room.status = 'pending';
  await room.save();

  return ResponseHandler.success(res, 'Gửi tin duyệt thành công', {
    room: serializeRoom(room),
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findOne({ _id: id, ownerId: req.user._id });
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng của bạn');
  }

  await room.deleteOne();
  return ResponseHandler.success(res, 'Xóa phòng thành công');
});

const adminListRooms = asyncHandler(async (req, res) => {
  const {
    status,
    q,
    page: pageRaw,
    limit: limitRaw,
  } = req.query;

  const page = Math.max(1, parseInt(pageRaw, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 10));
  const skip = (page - 1) * limit;

  const filters = {};
  if (status) {
    filters.status = status;
  }

  if (q && typeof q === 'string' && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filters.$or = [
      { title: regex },
      { address: regex },
      { description: regex },
    ];
  }

  const total = await Room.countDocuments(filters);
  const rooms = await Room.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return ResponseHandler.success(res, 'Lấy danh sách phòng (admin) thành công', {
    rooms: rooms.map(serializeRoom),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const adminGetRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  const room = await Room.findById(id).lean();
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  return ResponseHandler.success(res, 'Lấy chi tiết phòng thành công', {
    room: serializeRoom(room),
  });
});

const adminUpdateRoomStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason, note, adminNote } = req.body;
  const changeNote = (reason || note || adminNote || '').trim();

  if (!mongoose.isValidObjectId(id)) {
    return ResponseHandler.badRequest(res, 'ID phòng không hợp lệ');
  }

  if (!ADMIN_STATUSES.includes(status)) {
    return ResponseHandler.badRequest(res, 'Trạng thái không hợp lệ (pending/approved/rejected/needs_changes)');
  }

  if (status === 'needs_changes' && !changeNote) {
    return ResponseHandler.badRequest(res, 'Vui lòng nhập ghi chú yêu cầu chỉnh sửa');
  }

  const room = await Room.findById(id);
  if (!room) {
    return ResponseHandler.notFound(res, 'Không tìm thấy phòng');
  }

  room.status = status;

  if (status === 'needs_changes') {
    room.adminNote = changeNote;
    room.approvedAt = undefined;
    room.rejectedAt = undefined;
  } else if (changeNote) {
    room.adminNote = changeNote;
  }
  await room.save();

  // Notify owner when admin rejects or requests changes
  if (status === 'needs_changes' || status === 'rejected') {
    const isRevision = status === 'needs_changes';
    const title = isRevision ? 'Tin đăng cần chỉnh sửa' : 'Tin đăng bị từ chối';
    const message = isRevision
      ? `Tin "${room.title}" cần chỉnh sửa. Ghi chú: ${changeNote}`
      : `Tin "${room.title}" bị từ chối. Lý do: ${changeNote || 'Không có lý do'}`;

    const payload = {
      user: room.ownerId,
      sender: req.user?._id,
      type: isRevision ? 'room_revision_requested' : 'room_rejected',
      title,
      message,
      data: {
        roomId: room._id,
        status,
        reason: changeNote,
        actionRequired: isRevision ? 'update_listing' : undefined,
      },
    };

    try {
      await Notification.create(payload);

      const io = req.app.get('io');
      if (io?.sendNotificationToUser) {
        io.sendNotificationToUser(String(room.ownerId), {
          type: payload.type,
          title: payload.title,
          message: payload.message,
          data: payload.data,
        });
      }
    } catch (notifyErr) {
      console.error('Notify adminUpdateRoomStatus error:', notifyErr?.message);
    }
  }

  return ResponseHandler.success(res, 'Cập nhật trạng thái phòng thành công', {
    room: serializeRoom(room),
  });
});

/**
 * @desc    Lấy danh sách phòng đề xuất cho student
 * @route   GET /api/rooms/recommend
 * @access  Public (hoặc Student nếu muốn personalize)
 */
const getRecommendedRooms = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  
  // Lấy phòng được xem nhiều nhất trong 30 ngày qua (trending)
  const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_IN_MS);
  
  const ViewLog = require('../models/ViewLog');
  const trending = await ViewLog.aggregate([
    { $match: { viewedAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$roomId', viewCount: { $sum: 1 } } },
    { $sort: { viewCount: -1 } },
    { $limit: limit * 2 } // Lấy nhiều hơn để filter
  ]);
  
  const trendingRoomIds = trending.map(item => item._id);
  
  // Lấy phòng từ trending + filter public
  const trendingRooms = await Room.find({
    _id: { $in: trendingRoomIds },
    status: { $in: PUBLIC_STATUSES }
  }).limit(limit);
  
  // Nếu không đủ, lấy thêm phòng mới nhất
  let recommendedRooms = trendingRooms;
  
  if (recommendedRooms.length < limit) {
    const excludeIds = recommendedRooms.map(r => r._id);
    const newRooms = await Room.find({
      _id: { $nin: excludeIds },
      status: { $in: PUBLIC_STATUSES }
    })
    .sort({ createdAt: -1 })
    .limit(limit - recommendedRooms.length);
    
    recommendedRooms = [...recommendedRooms, ...newRooms];
  }
  
  // Return array directly in data for frontend compatibility
  const serializedRooms = recommendedRooms.map(serializeRoom);
  
  return ResponseHandler.success(res, 'Lấy phòng đề xuất thành công', serializedRooms);
});

module.exports = {
  listPublicRooms,
  getPublicRoom,
  createRoom,
  getHostRooms,
  getHostRoomDetail,
  updateRoom,
  uploadRoomImages,
  updateRoomLocationOnly,
  submitRoomForReview,
  deleteRoom,
  adminListRooms,
  adminGetRoom,
  adminUpdateRoomStatus,
  getRecommendedRooms,
};

module.exports.__testables = {
  validateStepOneFields,
  coerceNumber,
};
