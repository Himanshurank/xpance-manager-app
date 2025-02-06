import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const timeRanges = ["Week", "Month", "Year"] as const;
export type TimeRange = (typeof timeRanges)[number];

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <View style={styles.container}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.button,
            selectedRange === range && styles.selectedButton,
          ]}
          onPress={() => onRangeChange(range)}
        >
          <Text
            style={[
              styles.text,
              selectedRange === range && styles.selectedText,
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  selectedButton: {
    backgroundColor: "#1a73e8",
  },
  text: {
    color: "#666",
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
  },
});
