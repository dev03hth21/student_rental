const controller = require('../controllers/roomController');

const { validateStepOneFields, coerceNumber } = controller.__testables;

describe('Room Step One Validation', () => {
  test('rejects empty title', () => {
    const error = validateStepOneFields({
      type: 'Studio',
      title: '',
      description: 'Mô tả hợp lệ với hơn 20 ký tự',
      price: 1500000,
      area: 10,
    });

    expect(error).toMatch(/Tiêu đề/);
  });

  test('rejects short description', () => {
    const error = validateStepOneFields({
      type: 'Studio',
      title: 'Phòng đẹp',
      description: 'Quá ngắn',
      price: 1500000,
      area: 10,
    });

    expect(error).toMatch(/Mô tả/);
  });

  test('rejects invalid price and area', () => {
    const error = validateStepOneFields({
      type: 'Studio',
      title: 'Phòng mới xây',
      description: 'Mô tả hợp lệ dài trên hai mươi ký tự',
      price: 0,
      area: 3,
    });

    expect(error).toMatch(/Giá phòng phải là số lớn hơn 0|Diện tích phải lớn hơn 5m²/);
  });

  test('accepts valid payload', () => {
    const error = validateStepOneFields({
      type: 'Studio',
      title: 'Studio 30m² gần ĐH',
      description: 'Phòng full nội thất, gần trường và siêu thị, có bảo vệ 24/7.',
      price: 3500000,
      area: 20,
    });

    expect(error).toBeNull();
  });
  test('rejects missing room type', () => {
    const error = validateStepOneFields({
      title: 'Thiếu loại phòng',
      description: 'Phòng sạch sẽ, đầy đủ tiện nghi và gần trường học.',
      price: 1500000,
      area: 12,
    });

    expect(error).toMatch(/loại bất động sản/i);
  });
});

describe('coerceNumber helper', () => {
  test('parses string with thousand separators', () => {
    const parsed = coerceNumber('5.500.000');
    expect(parsed).toBe(5500000);
  });

  test('returns NaN for invalid input', () => {
    const parsed = coerceNumber('abc');
    expect(Number.isNaN(parsed)).toBe(true);
  });
});
