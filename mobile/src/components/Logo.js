import React from 'react';
import Svg, { Rect, Path, Text } from 'react-native-svg';

// Simplified, symmetric icon to match provided branding and avoid misalignment
export default function Logo({ size = 140 }) {
  const bgRadius = size * 0.1;
  const textSize = size * 0.16;
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" accessibilityLabel="Student Rental logo">
      {/* Light gray backdrop */}
      <Rect x="0" y="0" width="256" height="256" rx={bgRadius} fill="#e6e5e3" />

      {/* House shifted higher to clear text */}
      <Path d="M48 96 L128 28 L208 96 Z" fill="#1fb3e7" />

      <Rect x="72" y="96" width="112" height="88" rx="8" fill="#1fb3e7" />

      <Rect x="94" y="112" width="24" height="24" rx="3" fill="#ffffff" />
      <Rect x="138" y="112" width="24" height="24" rx="3" fill="#ffffff" />
      <Rect x="94" y="144" width="24" height="24" rx="3" fill="#ffffff" />
      <Rect x="138" y="144" width="24" height="24" rx="3" fill="#ffffff" />

      {/* Text */}
      <Text
        x="128"
        y="204"
        fontSize={textSize}
        fontWeight="700"
        fontFamily="System"
        fill="#ffffff"
        textAnchor="middle"
      >
        STUDENT
      </Text>
      <Text
        x="128"
        y="232"
        fontSize={textSize}
        fontWeight="700"
        fontFamily="System"
        fill="#ffffff"
        textAnchor="middle"
      >
        RENTAL
      </Text>
    </Svg>
  );
}
