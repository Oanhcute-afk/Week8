import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";
import { useDebounce } from "../hooks/useDebounce";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);

  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty, item.bookId, item.quantity, onChangeQty]);

  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <View style={styles.controlsRow}>
          <View style={styles.stepper}>
            <Pressable
              style={[styles.stepBtn, !canDec && styles.disabledBtn]}
              onPress={() => canDec && setQty((q) => q - 1)}
              disabled={!canDec}
              hitSlop={4}
              accessibilityLabel="Giảm"
            >
              <Text style={[styles.stepText, !canDec && styles.disabledText]}>−</Text>
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable
              style={[styles.stepBtn, !canInc && styles.disabledBtn]}
              onPress={() => canInc && setQty((q) => q + 1)}
              disabled={!canInc}
              hitSlop={4}
              accessibilityLabel="Tăng"
            >
              <Text style={[styles.stepText, !canInc && styles.disabledText]}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.stock}>Còn {item.stock}</Text>
        </View>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  controlsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 14, fontWeight: "700", color: colors.text, lineHeight: 16 },
  disabledBtn: { opacity: 0.35 },
  disabledText: { color: colors.muted },
  qty: { fontWeight: "700", color: colors.text, fontSize: 14, minWidth: 18, textAlign: "center" },
  stock: { color: colors.muted, fontSize: 12 },
  trash: { fontSize: 22 },
});
