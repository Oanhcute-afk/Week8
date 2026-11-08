import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number; // 0–5 (có thể lẻ, làm tròn khi vẽ)
  size?: number;
  onChange?: (v: number) => void; // có truyền → cho phép bấm chọn sao
}

export function RatingStars({ value, size = 18, onChange }: Props) {
  const rounded = Math.round(value);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const starEl = (
          <Text
            key={star}
            style={{
              fontSize: size,
              color: star <= rounded ? colors.warning : colors.line,
              lineHeight: size + 4,
            }}
          >
            ★
          </Text>
        );

        if (onChange) {
          return (
            <Pressable key={star} onPress={() => onChange(star)} hitSlop={4} accessibilityLabel={`${star} sao`}>
              {starEl}
            </Pressable>
          );
        }
        return starEl;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
