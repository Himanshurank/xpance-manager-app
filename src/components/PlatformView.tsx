import React from "react";
import { Platform, View, ViewStyle } from "react-native";

interface PlatformViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  ios?: {
    style?: ViewStyle;
  };
  android?: {
    style?: ViewStyle;
  };
}

export const PlatformView: React.FC<PlatformViewProps> = ({
  children,
  style,
  ios,
  android,
  ...props
}) => {
  const platformStyle = Platform.select({
    ios: ios?.style,
    android: android?.style,
  });

  return (
    <View style={[style, platformStyle]} {...props}>
      {children}
    </View>
  );
};
