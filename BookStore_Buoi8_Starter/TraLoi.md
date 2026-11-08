# Trả lời câu hỏi bổ sung — Buổi 8

## 1. Cờ `ready` trong `useAutoPersist`
**Hiện tượng khi bỏ điều kiện `ready`:** Giỏ hàng đã lưu trước đó trong `AsyncStorage` sẽ bị mất sạch (luôn trở về giỏ rỗng khi mở lại app).

**Giải thích theo thứ tự các lần render:**
1. **Lần render đầu tiên (Initial Mount):** Redux store khởi tạo với state mặc định ban đầu là mảng rỗng `items: []`. Đồng thời, tác vụ đọc bất đồng bộ `loadJSON<CartItem[]>(CART_KEY)` trong `useEffect` của `usePersistence` mới bắt đầu chạy và chưa có kết quả ngay.
2. **Effect chạy ngay sau render:** Nếu không có cờ `ready` chặn lại, hook `useAutoPersist` sẽ chạy ngay lập tức với giá trị hiện tại là mảng rỗng `items: []` và gọi `saveJSON(CART_KEY, [])`. Lệnh này ghi đè mảng rỗng lên dữ liệu giỏ hàng cũ đã lưu trong `AsyncStorage`.
3. **Khi hàm đọc AsyncStorage hoàn tất:** Lúc này dữ liệu nạp lên từ storage đã bị ghi đè thành rỗng, dẫn đến mất toàn bộ giỏ hàng cũ.
> **Ý nghĩa của cờ `ready`:** Chỉ bật lên `true` sau khi toàn bộ dữ liệu cũ đã nạp xong vào store, bảo đảm quá trình tự động lưu chỉ diễn ra khi người dùng thực sự thay đổi dữ liệu.

---

## 2. Token giả lập và Bảo mật
**Hai điểm không an toàn trong bài tập:**
1. **Mật khẩu dạng thô (Plain-text):** Mật khẩu nằm lộ trong file `db.json` và client tự tải toàn bộ danh sách users về để so sánh `found.password !== password`. Bất kỳ ai kiểm tra Network tab hoặc bộ nhớ app đều đọc được mật khẩu của tất cả người dùng.
2. **Token không có chữ ký số:** Token được sinh giả lập ở client (`token-${u.id}-${Date.now()}`), không hề có chữ ký bảo mật mật mã học (như secret key trong JWT), kẻ gian có thể tự bịa ra token để mạo danh bất kỳ user nào.

**Trong hệ thống thực tế:**
* **Kiểm tra mật khẩu:** Chỉ có **Server (Backend)** mới có quyền nhận mật khẩu qua HTTPS, so sánh mật khẩu với chuỗi hash an toàn (sử dụng các thuật toán như `bcrypt`, `argon2`), và server là bên duy nhất cấp token xác thực (thường là JWT có hạn dùng).
* **Nơi lưu token an toàn:** Trên thiết bị di động, token phải được lưu trong kho khóa phần cứng bảo mật của hệ điều hành: **SecureStore** (iOS Keychain / Android Keystore), tuyệt đối không lưu dạng plain-text trong `AsyncStorage` hay `localStorage` vì dễ bị tấn công XSS / trích xuất dữ liệu.

---

## 3. Hai effect trong `CartItemRow`
**Thao tác làm số lượng trên nút bị lệch so với Store nếu xóa `useEffect(() => { setQty(item.quantity); }, [item.quantity])`:**
* **Thao tác 1 (Nạp dữ liệu mở app):** Khi app mở lên, state cục bộ `qty` được gán giá trị của `item.quantity` ban đầu. Sau khi `hydrateCart` nạp dữ liệu thật từ `AsyncStorage` vào store, nếu không có effect đồng bộ thì `qty` trên giao diện vẫn giữ nguyên giá trị khởi tạo cũ.
* **Thao tác 2 (Thêm từ nơi khác):** Khi sách đã có trong giỏ, người dùng quay lại trang Chi tiết sách (`BookDetailScreen`) và bấm nút *"Thêm vào giỏ"* một hoặc nhiều lần nữa. Khi quay lại Giỏ hàng, do thiếu effect đồng bộ, con số hiển thị trên nút vẫn giữ nguyên số cũ dù store đã tăng lên.

---

## 4. Một nguồn trạng thái (Single Source of Truth)
* **Nếu mỗi `HeartButton` dùng `useState` riêng:** Trạng thái của từng nút tim sẽ hoàn toàn độc lập với nhau. Ví dụ: khi người dùng bấm tim ở lưới sách màn Home, chỉ có nút tim tại Home chuyển sang màu đỏ; khi mở vào trang Chi tiết sách, nút tim ở trang Chi tiết vẫn là `useState(false)` (tim viền xám), gây ra sự bất đồng bộ dữ liệu nghiêm trọng.
* **Redux Store giải quyết vấn đề:** Redux đóng vai trò là "nguồn chân lý duy nhất" (Single Source of Truth). Danh sách ID yêu thích `ids` được lưu tập trung tại một nơi. Cả component tim ở lưới sách (`BookCard`) và ở trang chi tiết (`BookDetailScreen`) đều cùng subscribe vào store qua hook `useWishlist()`. Khi có hành động `toggleWishlist(bookId)`, toàn bộ các nút tim liên quan đều nhận được giá trị mới nhất và tự động re-render đồng bộ.

---

## 5. Code bổ sung: Nút 👁 ẩn/hiện mật khẩu ở màn Đăng nhập

Đã bổ sung thuộc tính `rightElement` vào `FormField` và thêm state `showPassword` vào `LoginScreen`:

### Code đã cài đặt trong `src/screens/LoginScreen.tsx`:
```tsx
const [showPassword, setShowPassword] = useState(false);

// ...
<FormField
  label="Mật khẩu"
  value={password}
  onChangeText={(text) => {
    setPassword(text);
    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
  }}
  secureTextEntry={!showPassword}
  placeholder="Tối thiểu 6 ký tự"
  error={errors.password}
  rightElement={
    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} accessibilityLabel="Hiện hoặc ẩn mật khẩu">
      <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁"}</Text>
    </Pressable>
  }
/>
```
* Bấm vào biểu tượng `👁` sẽ chuyển trạng thái `secureTextEntry` sang `false` để hiện mật khẩu dạng chữ rõ (đồng thời chuyển icon sang `🙈`). Bấm lần nữa để ẩn mật khẩu lại thành các dấu chấm tròn `••••••`.
