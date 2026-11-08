import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { useAuth, useCart } from "../store/hooks";
import { confirmDialog } from "../utils/dialog";
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice, radius } from "../theme";

export function CartScreen({ navigation }: TabScreenProps<"Cart">) {
  const { items, totalPrice, setQty, remove } = useCart();
  const { isLoggedIn } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "SALE10") {
      setAppliedCoupon("SALE10");
      setCouponError(null);
    } else if (code === "GIAM50K") {
      setAppliedCoupon("GIAM50K");
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError("Mã giảm giá không hợp lệ");
    }
  };

  let discount = 0;
  if (appliedCoupon === "SALE10") {
    discount = Math.round(totalPrice * 0.1);
  } else if (appliedCoupon === "GIAM50K") {
    discount = Math.min(50000, totalPrice);
  }
  const finalTotal = Math.max(0, totalPrice - discount);

  const askRemove = (bookId: number) => {
    const item = items.find((i) => i.bookId === bookId);
    confirmDialog(
      "Xóa sản phẩm",
      `Xóa "${item?.title ?? "sách"}" khỏi giỏ hàng?`,
      () => remove(bookId)
    );
  };

  const goCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate("Checkout", { total: finalTotal });
    } else {
      navigation.navigate("Login", { redirectTo: "Checkout", total: finalTotal });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.bookId)}
        renderItem={({ item }) => <CartItemRow item={item} onChangeQty={setQty} onRemove={askRemove} />}
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState emoji="🛒" title="Giỏ hàng trống" message="Hãy chọn vài cuốn sách yêu thích nhé." actionLabel="Khám phá sách" onAction={() => navigation.navigate("Home")} />
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Mã giảm giá (SALE10)"
              placeholderTextColor={colors.muted}
              value={couponCode}
              onChangeText={(t) => {
                setCouponCode(t);
                if (couponError) setCouponError(null);
              }}
              autoCapitalize="characters"
            />
            <Pressable style={styles.couponBtn} onPress={handleApplyCoupon}>
              <Text style={styles.couponBtnText}>Áp dụng</Text>
            </Pressable>
          </View>
          {appliedCoupon ? (
            <Text style={styles.couponSuccess}>
              Đã áp dụng {appliedCoupon}: {appliedCoupon === "SALE10" ? "Giảm 10%" : "Giảm 50.000đ"}
            </Text>
          ) : null}
          {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}

          <View style={styles.line}><Text style={styles.muted}>Tạm tính</Text><Text style={styles.value}>{formatPrice(totalPrice)}</Text></View>
          {discount > 0 && (
            <View style={styles.line}><Text style={styles.muted}>Giảm giá</Text><Text style={styles.discount}>-{formatPrice(discount)}</Text></View>
          )}
          <View style={styles.line}><Text style={styles.total}>Tổng cộng</Text><Text style={styles.total}>{formatPrice(finalTotal)}</Text></View>
          <PrimaryButton title="Thanh toán" onPress={goCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  footer: { backgroundColor: "#fff", padding: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  couponRow: { flexDirection: "row", gap: 8 },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  couponBtn: {
    backgroundColor: colors.indigo,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  couponBtnText: { color: "#fff", fontWeight: "700" },
  couponSuccess: { color: colors.success, fontSize: 13, fontWeight: "600" },
  couponError: { color: colors.danger, fontSize: 13 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  muted: { color: colors.muted },
  value: { fontWeight: "700", color: colors.text },
  discount: { fontWeight: "700", color: colors.success },
  total: { fontSize: 17, fontWeight: "800", color: colors.navy },
});
