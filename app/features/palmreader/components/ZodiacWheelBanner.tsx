/**
 * ZodiacWheelBanner
 * Decorative zodiac-wheel header graphic with a notched ribbon banner
 * across it — built from SVG (no external image asset) so it stays
 * on-brand with DESTINO's purple/gold palette.
 *
 * All wheel geometry is static (doesn't depend on props), so it's computed
 * once at module load and the SVG itself is memoized — otherwise every
 * re-render of the parent screen (e.g. the audio player's status hook
 * firing every ~500ms while a reading is loaded) would recompute and
 * re-mount ~70 SVG nodes for no reason, which is what was making scrolling
 * feel janky.
 */

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Path, Text as SvgText, Defs, LinearGradient, Stop, Polygon } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");
const SIZE = Math.min(screenWidth - 100, 340);
const RADIUS = SIZE / 2;
const CENTER = SIZE / 2;
const OUTER_R = RADIUS - 4;
const SYMBOL_RADIUS = RADIUS * 0.7;
const DOT_RADIUS = RADIUS - 14;

const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function polar(radius: number, angleDeg: number) {
  const angle = (angleDeg - 90) * (Math.PI / 180);
  return { x: CENTER + Math.cos(angle) * radius, y: CENTER + Math.sin(angle) * radius };
}

function segmentPath(startDeg: number, endDeg: number, r: number) {
  const start = polar(r, startDeg);
  const end = polar(r, endDeg);
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`;
}

// Computed once at module load — none of this depends on props.
const RIBBON_HALF_HEIGHT = SIZE * 0.105;
const RIBBON_NOTCH = SIZE * 0.045;
const RIBBON_TOP = CENTER - RIBBON_HALF_HEIGHT;
const RIBBON_BOTTOM = CENTER + RIBBON_HALF_HEIGHT;
const RIBBON_POINTS = [
  `0,${RIBBON_TOP}`,
  `${SIZE},${RIBBON_TOP}`,
  `${SIZE - RIBBON_NOTCH},${CENTER}`,
  `${SIZE},${RIBBON_BOTTOM}`,
  `0,${RIBBON_BOTTOM}`,
  `${RIBBON_NOTCH},${CENTER}`,
].join(" ");

const BORDER_DOTS = Array.from({ length: 36 }, (_, i) => polar(DOT_RADIUS, i * 10));
const SEGMENTS = ZODIAC_SYMBOLS.map((_, index) => ({
  key: `seg-${index}`,
  d: segmentPath(index * 30, index * 30 + 30, OUTER_R - 6),
  fill: index % 2 === 0 ? "#F1ECFF" : "#FFFDFC",
}));
const SPOKES = ZODIAC_SYMBOLS.map((_, index) => {
  const p = polar(OUTER_R - 8, index * 30);
  return { key: `spoke-${index}`, d: `M ${CENTER} ${CENTER} L ${p.x} ${p.y}` };
});
const GLYPHS = ZODIAC_SYMBOLS.map((symbol, index) => {
  const p = polar(SYMBOL_RADIUS, index * 30 + 15);
  return { key: symbol, symbol, x: p.x, y: p.y };
});

/** Static wheel artwork — has no props, so React.memo means it renders exactly once. */
const WheelGraphic = React.memo(() => (
  <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
    <Defs>
      <LinearGradient id="wheelRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#D4AF37" stopOpacity={1} />
        <Stop offset="100%" stopColor="#7B68EE" stopOpacity={1} />
      </LinearGradient>
    </Defs>

    <Circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="#FFFDFC" stroke="url(#wheelRing)" strokeWidth={4} />

    {SEGMENTS.map((seg) => (
      <Path key={seg.key} d={seg.d} fill={seg.fill} />
    ))}

    {BORDER_DOTS.map((dot, index) => (
      <Circle key={`dot-${index}`} cx={dot.x} cy={dot.y} r={1.6} fill="#D4AF37" opacity={0.7} />
    ))}

    {SPOKES.map((spoke) => (
      <Path key={spoke.key} d={spoke.d} stroke="#7B68EE" strokeOpacity={0.25} strokeWidth={1} />
    ))}

    <Circle cx={CENTER} cy={CENTER} r={RADIUS * 0.16} fill="#FFFDFC" stroke="#D4AF37" strokeWidth={1.5} />
    <SvgText x={CENTER} y={CENTER + SIZE * 0.02} fontSize={SIZE * 0.09} fill="#7B68EE" textAnchor="middle" alignmentBaseline="middle">
      ✨
    </SvgText>

    {GLYPHS.map((glyph) => (
      <SvgText key={glyph.key} x={glyph.x} y={glyph.y} fontSize={SIZE * 0.058} fill="#5B35D5" textAnchor="middle" alignmentBaseline="middle">
        {glyph.symbol}
      </SvgText>
    ))}

    <Polygon points={RIBBON_POINTS} fill="url(#wheelRing)" opacity={0.97} />
  </Svg>
));
WheelGraphic.displayName = "WheelGraphic";

interface ZodiacWheelBannerProps {
  title: string;
  subtitle?: string;
}

export const ZodiacWheelBanner: React.FC<ZodiacWheelBannerProps> = React.memo(({ title, subtitle }) => {
  return (
    <View style={styles.wrapper}>
      <WheelGraphic />

      {/* Ribbon text overlaid (native Text renders crisper than SVG text at this size) */}
      <View style={[styles.ribbonTextWrap, { width: SIZE * 0.82 }]} pointerEvents="none">
        <Text style={[styles.ribbonTitle, { fontSize: SIZE * 0.082 }]} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.ribbonSubtitle, { fontSize: SIZE * 0.032 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
});
ZodiacWheelBanner.displayName = "ZodiacWheelBanner";

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  ribbonTextWrap: {
    position: "absolute",
    alignItems: "center",
  },
  ribbonTitle: {
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ribbonSubtitle: {
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
});
