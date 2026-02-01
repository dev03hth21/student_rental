export const rooms = [
  {
    id: 'room-1',
    title: 'Căn hộ studio đầy đủ nội thất gần ĐH Bách Khoa',
    description:
      'Phòng mới xây, có ban công thoáng mát, đầy đủ nội thất: máy lạnh, máy giặt, bếp điện, tủ lạnh.',
    address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
    district: 'Quận 10',
    city: 'TP.HCM',
    price: 3500000,
    area: 25,
    maxPeople: 2,
    amenities: ['Máy lạnh', 'Máy giặt', 'Bếp', 'Giường đôi', 'Bãi để xe'],
    utilities: {
      electricity: 3500,
      water: 15000,
      wifi: 'Miễn phí',
    },
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
    ],
    owner: {
      id: 'owner-1',
      name: 'Nguyễn Minh Tâm',
      phone: '0901234567',
      rating: 4.8,
    },
    rating: 4.7,
    reviews: 23,
    status: 'available',
    createdAt: '2025-01-10',
  },
  {
    id: 'room-2',
    title: 'Phòng trọ giá rẻ cho sinh viên ĐH Kinh Tế',
    description:
      'Phòng rộng 20m², có cửa sổ, WC riêng, giờ giấc tự do, khu dân cư yên tĩnh an ninh tốt.',
    address: '59C Nguyễn Đình Chiểu, Quận 3, TP.HCM',
    district: 'Quận 3',
    city: 'TP.HCM',
    price: 2500000,
    area: 20,
    maxPeople: 2,
    amenities: ['Giường tầng', 'Tủ đồ', 'Bãi xe', 'Camera an ninh'],
    utilities: {
      electricity: 3500,
      water: 12000,
      wifi: '100k/tháng',
    },
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    owner: {
      id: 'owner-2',
      name: 'Trần Quốc Việt',
      phone: '0987654321',
      rating: 4.5,
    },
    rating: 4.5,
    reviews: 12,
    status: 'available',
    createdAt: '2025-02-02',
  },
  {
    id: 'room-3',
    title: 'Căn hộ mini cao cấp khu Thảo Điền',
    description:
      'Căn hộ 45m², nội thất cao cấp, có hồ bơi chung, phòng gym và khu BBQ trên sân thượng.',
    address: '12 Nguyễn Văn Hưởng, TP.Thủ Đức',
    district: 'Thảo Điền',
    city: 'TP.Thủ Đức',
    price: 7000000,
    area: 45,
    maxPeople: 3,
    amenities: ['Hồ bơi', 'Gym', 'Bãi giữ xe', 'Ban công', 'Đầy đủ nội thất'],
    utilities: {
      electricity: 4000,
      water: 20000,
      wifi: 'Miễn phí',
    },
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    ],
    owner: {
      id: 'owner-3',
      name: 'Lê Hoài An',
      phone: '0912123456',
      rating: 4.9,
    },
    rating: 4.9,
    reviews: 54,
    status: 'available',
    createdAt: '2025-02-20',
  },
];

export function getRoomById(id) {
  return rooms.find((room) => room.id === id);
}
