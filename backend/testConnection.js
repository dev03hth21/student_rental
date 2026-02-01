/**
 * Test MongoDB Connection
 * Script để kiểm tra kết nối database
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔄 Đang kết nối đến MongoDB...');
    console.log('📍 URI:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Kết nối MongoDB thành công!');
    console.log('📦 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔢 Port:', mongoose.connection.port);

    // Đóng kết nối
    await mongoose.connection.close();
    console.log('👋 Đã đóng kết nối');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    console.error('\n📝 Hướng dẫn:');
    console.error('1. Nếu dùng MongoDB Atlas:');
    console.error('   - Truy cập https://cloud.mongodb.com');
    console.error('   - Tạo cluster miễn phí');
    console.error('   - Lấy connection string và cập nhật vào .env');
    console.error('   - Ví dụ: mongodb+srv://<username>:<password>@cluster.mongodb.net/student-rental');
    console.error('\n2. Nếu dùng MongoDB local:');
    console.error('   - Cài đặt MongoDB: https://www.mongodb.com/try/download/community');
    console.error('   - Chạy MongoDB service');
    console.error('   - Sử dụng: mongodb://localhost:27017/student-rental');
    process.exit(1);
  }
};

testConnection();
