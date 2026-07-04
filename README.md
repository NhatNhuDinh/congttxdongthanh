# Demo — Hệ thống thu giá DV vệ sinh môi trường (Xã Đông Thạnh)

Demo ReactJS **không cần backend**, mô phỏng **5 vai trò** của Hệ thống số hóa quản lý và thu giá
dịch vụ vệ sinh môi trường — Xã Đông Thạnh, TP.HCM (theo Tài liệu thiết kế hệ thống **v2.0**).
Giao diện theo phong cách Jmix / Vaadin Lumo (drawer trái + header).

## Chạy demo

```bash
npm install
npm run dev        # mở http://localhost:5188
npm run build      # đóng gói tĩnh (dist/) để gửi khách
```

**Đăng nhập:** tài khoản/mật khẩu điền sẵn **admin / admin** — chỉ cần **chọn vai trò** rồi bấm Đăng nhập.
Mỗi vai có menu & chức năng riêng theo phân quyền (RBAC). Bấm nút ↻ cuối drawer để khôi phục dữ liệu demo;
đổi vai bằng nút Đăng xuất rồi chọn vai khác.

## 5 vai trò & chức năng

### Quản trị hệ thống (QT) — *quyền kỹ thuật, không duyệt tiền*
Người dùng & phân quyền (QT-01/02), địa bàn & ánh xạ địa giới cũ→mới (QT-04), biểu giá theo thời kỳ (BG),
kết nối VietQR/HĐĐT/KBNN (QT-06), nhật ký & audit trail (QT-09).

### Cán bộ xã (CB) — *danh mục hộ, hóa đơn, đề nghị miễn giảm*
Tra cứu hộ toàn xã (DM-07), chống trùng khi hợp nhất 3 xã (DM-04), sinh khoản theo đợt (HD-01/02),
tạo khoản thu lẻ (HD-03), lập đề nghị miễn giảm trình lãnh đạo (CN-04), theo dõi công nợ (CN-01/03).

### Người thu hộ (NTH) — *đi thu tại hộ theo tuyến được phân công*
Danh sách đi thu phân 3 nhóm **Chưa thu / Đã đóng / Chờ nộp**, màn hình thu khóa trường + che CCCD/SĐT (TH-02),
dân quét QR tại chỗ (TH-04), hộ đóng tiền mặt → **túi tiền, nộp cuối ngày** kiểu ví COD shipper (TH-06),
chặn thu trùng (TH-11), giấy báo vắng nhà (TH-12), người đóng thay (TH-13), in/gửi biên lai (TH-10).

### Kế toán (KT) — *khớp sao kê, dòng treo, đối soát, báo cáo*
Khớp sao kê theo mã → phát hành biên lai (TH-07/09), xử lý dòng treo gán tay/hoàn/xác minh (TH-08),
**đối soát tiền mặt người thu — đã thu vs đã nộp (BC-11)**, sổ biên lai/HĐĐT (BC-04), báo cáo thu/nợ theo địa bàn (BC-02/03).

### Lãnh đạo (LĐ) — *quyền nghiệp vụ cao nhất, quyết định về tiền*
Dashboard điều hành (BC-01), phân công đi thu theo tuyến (TH-01), **duyệt miễn giảm/hoàn/xóa nợ** (mục 8.6),
**ký duyệt cả đợt hóa đơn** một lần (8.6), báo cáo điều hành.

## Vòng đời một khoản thu (demo liên vai)
1. **CB** sinh khoản theo đợt / tạo khoản lẻ → **LĐ** ký duyệt đợt.
2. **NTH** đi thu: hộ tự quét QR (vào thẳng hệ thống) hoặc đóng tiền mặt (vào túi tiền, nộp cuối ngày).
3. **KT** khớp sao kê → phát hành biên lai; đối soát túi tiền mặt của NTH (BC-11).
4. **CB** lập đề nghị miễn giảm → **LĐ** duyệt.
5. **QT** giám sát qua nhật ký audit; mọi thao tác động đến tiền đều ghi log.

Dữ liệu demo lưu `localStorage` (key `dt-multirole-demo-v1`) — chia sẻ giữa các vai để thấy hành động
của vai này phản ánh sang vai khác. Bấm ↻ để reset trước mỗi buổi demo.
