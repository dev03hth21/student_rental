const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const GEOJSON_PATH = process.env.SRP_GEOJSON_PATH || path.resolve(__dirname, '..', 'thudaumot.geojson');

const SUPPORTED_GEOMETRIES = {
  building: new Set(['Polygon', 'MultiPolygon']),
  road: new Set(['LineString', 'MultiLineString']),
};

const filterGeoJsonFeatures = (geojson) => {
  if (!geojson || !Array.isArray(geojson.features)) {
    return geojson;
  }

  const features = geojson.features.filter((feature) => {
    const geometryType = feature?.geometry?.type;
    const props = feature?.properties || {};
    const isBuilding = Boolean(props.building) && SUPPORTED_GEOMETRIES.building.has(geometryType);
    const isRoad = Boolean(props.highway) && SUPPORTED_GEOMETRIES.road.has(geometryType);
    return isBuilding || isRoad;
  });

  return { ...geojson, features };
};

router.get('/thudaumot', async (req, res, next) => {
  try {
    const raw = await fs.readFile(GEOJSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    res.json(filterGeoJsonFeatures(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'Chưa tìm thấy file thudaumot.geojson. Hãy chạy script chuyển đổi OSM trước.'
      });
    }

    return next(error);
  }
});

module.exports = router;
