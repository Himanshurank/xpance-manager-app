import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { View, StyleSheet } from "react-native";

interface LogoProps {
  size?: number;
  color?: string;
}

export function Logo({ size = 40, color = "#1a73e8" }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
          d="M8 12h8M12 8v8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
          stroke="#fff"
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
