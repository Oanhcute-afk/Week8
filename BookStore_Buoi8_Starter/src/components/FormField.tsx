import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radius } from "../theme";

interface Props extends TextInputProps {
  label: string;
  error?: string | null; // có lỗi → viền đỏ + dòng báo lỗi NGAY DƯỚI ô nhập
  rightElement?: React.ReactNode;
}

export function FormField({ label, error, style, rightElement, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, rightElement ? styles.inputWithRight : null, style]}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          {...rest}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: { fontWeight: "700", color: colors.text },
  inputWrap: { position: "relative", justifyContent: "center" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, color: colors.text },
  inputWithRight: { paddingRight: 42 },
  inputError: { borderColor: colors.danger },
  rightElement: { position: "absolute", right: 12, height: "100%", justifyContent: "center", alignItems: "center" },
  error: { color: colors.danger, fontSize: 12 },
});
