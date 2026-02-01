#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const osmtogeojson = require('osmtogeojson');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SOURCE_FILE = process.env.SRP_OSM_SOURCE || path.resolve(ROOT_DIR, 'phuongthudaumot.osm');
const OUTPUT_FILE = process.env.SRP_GEOJSON_OUTPUT || path.resolve(__dirname, '..', 'thudaumot.geojson');

function convertOSM() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Không tìm thấy file OSM tại ${SOURCE_FILE}`);
  }

  const xml = fs.readFileSync(SOURCE_FILE, 'utf8');
  const dom = new DOMParser().parseFromString(xml, 'text/xml');
  const geojson = osmtogeojson(dom);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geojson, null, 2), 'utf8');
  console.log('✔ Đã tạo GeoJSON:', OUTPUT_FILE);
}

if (require.main === module) {
  try {
    convertOSM();
  } catch (error) {
    console.error('❌ Lỗi chuyển đổi OSM → GeoJSON:', error.message);
    process.exitCode = 1;
  }
}

module.exports = convertOSM;
