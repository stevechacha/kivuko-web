// components/BridgeIllustration.tsx
// Signature visual: Mainland (Kilimanjaro) and Zanzibar (dhow/ocean) joined by
// a glowing kivuko (bridge). Requires react-native-svg.
import React from 'react';
import Svg, { Rect, Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { colors } from '../theme/colors';

interface Props {
  width?: number;
  height?: number;
}

export default function BridgeIllustration({ width = 340, height = 260 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 420 340">
      <Rect x={0} y={0} width={420} height={340} rx={20} fill="#F0F5F4" />

      {/* Mainland — Kilimanjaro silhouette */}
      <Path d="M0 210 L60 120 L95 165 L140 95 L190 210 Z" fill={colors.green} opacity={0.85} />
      <Path d="M120 118 L140 95 L160 122 Z" fill={colors.bg} />

      {/* Zanzibar — ocean + dhow */}
      <Path
        d="M420 340 L420 235 Q360 220 300 235 Q260 245 210 235 L210 340 Z"
        fill={colors.blue}
        opacity={0.9}
      />
      <Path d="M330 225 L330 195 L360 222 Z" fill={colors.bg} />
      <Line x1={330} y1={195} x2={330} y2={228} stroke={colors.bg} strokeWidth={2} />

      {/* The bridge (kivuko) */}
      <Path
        d="M110 205 C 170 160, 250 160, 310 205"
        stroke={colors.gold}
        strokeWidth={3}
        fill="none"
        strokeDasharray="6 6"
      />
      <Circle cx={110} cy={205} r={6} fill={colors.green} />
      <Circle cx={310} cy={205} r={6} fill={colors.blue} />

      <SvgText x={55} y={270} fontSize={11} fontWeight="bold" fill={colors.greenDeep}>
        BARA
      </SvgText>
      <SvgText x={335} y={270} fontSize={11} fontWeight="bold" fill={colors.blueDeep}>
        VISIWANI
      </SvgText>
    </Svg>
  );
}
