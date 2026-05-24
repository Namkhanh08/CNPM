# ĐẶC TẢ USE CASE: XEM THÔNG TIN VÙNG TRỒNG & TRUY XUẤT NGUỒN GỐC

## 1. Thông tin chung
* **Mã Use case:** UC-07
* **Tên Use case:** Xem thông tin vùng trồng & truy xuất nguồn gốc
* **Tác nhân:** Khách hàng (Coffee Lover)
* **Mức độ ưu tiên:** Cao (Tính năng cốt lõi tạo giá trị minh bạch cho Revo Coffee)

## 2. Mô tả ngắn
Khách hàng có thể tra cứu và xem chi tiết toàn bộ hành trình lịch sử của gói cà phê mình đang quan tâm hoặc đã mua. Thông tin hiển thị bao gồm: xuất xứ vùng trồng, thông tin hộ nông dân/hợp tác xã, nhật ký lô thu hoạch, phương pháp sơ chế, nhật ký lô rang (Roast Batch) và các chứng nhận chất lượng liên quan (Organic, Fair Trade, UTZ, Farm Gate...). Quá trình này giúp đảm bảo tính minh bạch, gia tăng trải nghiệm và củng cố niềm tin của khách hàng đối với sản phẩm.

## 3. Các điều kiện kích hoạt, tiền điều kiện & hậu điều kiện
* **Sự kiện kích hoạt:** Từ giao diện trang chi tiết sản phẩm (UC-02), khách hàng nhấn vào nút hoặc liên kết **“Xem nguồn gốc”** hoặc **“Truy xuất nguồn gốc sản phẩm”**.
* **Tiền điều kiện:** * Sản phẩm hiện tại đã được cấu hình và liên kết dữ liệu trong hệ thống bao gồm: tối thiểu 1 lô rang (Roast Batch) còn hiệu lực, thông tin vùng trồng và nông hộ/hợp tác xã tương ứng.
  * Các thông tin chứng nhận chất lượng (nếu có) đã được bộ phận quản lý nhập liệu và kiểm duyệt thành công trên hệ thống.
* **Hậu điều kiện:**
  * Hệ thống hiển thị trực quan chuỗi cung ứng sản phẩm theo dòng thời gian (Timeline): `Vùng trồng → Nông hộ → Lô thu hoạch → Lô rang → Sản phẩm hoàn thiện`.
  * Hệ thống tự động ghi nhận nhật ký (Log Analytics) lượt xem truy xuất nguồn gốc của khách hàng để phục vụ hoạt động phân tích thị trường và hành vi người dùng.

## 4. Luồng sự kiện chính (Thành công)

| Bước | Hành động của Tác nhân (Khách hàng) | Phản hồi của Hệ thống |
| :--- | :--- | :--- |
| **1** | Khách hàng đang ở giao diện trang chi tiết một sản phẩm cà phê bất kỳ (UC-02). | |
| **2** | Khách hàng nhấn chọn nút **“Xem nguồn gốc / Truy xuất lô”**. | |
| **3** | | Hệ thống tiếp nhận yêu cầu và tự động thực hiện truy vấn cơ sở dữ liệu dựa trên Mã sản phẩm (`Product_ID`), bao gồm:<br>- **Vùng trồng:** Tỉnh/khu vực, độ cao so với mực nước biển, khí hậu, thổ nhưỡng.<br>- **Nông hộ/Hợp tác xã:** Tên hộ/nông trại, quy mô canh tác, phương pháp canh tác (Hữu cơ, Shade-grown...).<br>- **Lô thu hoạch:** Mã lô, thời gian thu hoạch, quy trình sơ chế (Wash, Natural, Honey...).<br>- **Lô rang liên quan:** Mã lô rang, ngày rang, mức độ rang (Light/Medium/Dark Profile).<br>- **Chứng nhận chất lượng:** Tên chứng chỉ, đơn vị cấp, thời hạn hiệu lực, liên kết tệp/hình ảnh chứng nhận gốc. |
| **4** | | Hệ thống tổng hợp dữ liệu và hiển thị giao diện "Hành trình truy xuất nguồn gốc" được chia thành các phân đoạn rõ ràng:<br>- **Phần 1 (Tóm tắt nhanh):** Hiển thị dòng trạng thái cốt lõi (Ví dụ: *"Arabica – Lâm Đồng – 1500m – Honey Process"*).<br>- **Phần 2 (Chi tiết gốc):** Bản đồ/Hình ảnh và mô tả sâu về vùng trồng & nông hộ.<br>- **Phần 3 (Nhật ký chế biến & rang):** Chi tiết mã lô thu hoạch và thông số mẻ rang gắn liền.<br>- **Phần 4 (Chứng chỉ uy tín):** Danh sách các chứng nhận trực quan đi kèm tính năng tải xuống/xem ảnh gốc. |
| **5** | Khách hàng có thể chọn:<br>- Nhấn mở rộng để đọc thêm câu chuyện nông hộ (Popup/Accordion).<br>- Tải về chứng nhận chất lượng sản phẩm.<br>- Nhấn "Quay lại" để về trang chi tiết sản phẩm và thực hiện mua hàng (Chọn kiểu xay, số lượng, thêm vào giỏ). | |

## 5. Luồng thay thế và Ngoại lệ

### Luồng 3a: Sản phẩm thiếu hoặc chưa cập nhật dữ liệu truy xuất cụ thể
* **Điều kiện xảy ra:** Sản phẩm là dòng thử nghiệm mới hoặc thuộc lô hàng cũ chưa được nhân viên kiểm kho cập nhật kịp thời mã lô rang/mã nông hộ trên hệ thống Admin.
* **Xử lý của Hệ thống:**
  1. Hệ thống không hiển thị cấu trúc trống (blank) mà chủ động hiển thị thông báo thân thiện: *“Sản phẩm này hiện chưa cập nhật đầy đủ thông tin truy xuất nguồn gốc chi tiết. Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng để biết thêm chi tiết.”*
  2. Hệ thống vẫn hiển thị tối đa các thông tin tổng quát có sẵn trong danh mục sản phẩm (ví dụ: thông tin chung về chủng loại hạt, vùng trồng cấp tỉnh) và ẩn các phần dữ liệu chuyên sâu chưa có (mã batch rang, nông hộ cụ thể).

### Luồng 3b: Dữ liệu lô rang đã quá hạn khuyến nghị (Archive)
* **Điều kiện xảy ra:** Khách hàng thực hiện quét mã hoặc truy xuất một sản phẩm có ngày rang đã quá xa so với thời gian bảo quản và sử dụng tốt nhất (Best Before).
* **Xử lý của Hệ thống:**
  * **Phương án 1 (Mặc định):** Hệ thống vẫn hiển thị đầy đủ thông tin lịch sử của lô hàng đó nhằm đảm bảo tính minh bạch tối đa, tuy nhiên sẽ bổ sung một nhãn cảnh báo trực quan: *“Lưu ý: Lô rang này đã vượt quá thời gian bảo quản khuyến nghị từ nhà rang xay. Thông tin hiển thị phục vụ mục đích tra cứu lịch sử.”*
  * **Phương án 2 (Đối với sản phẩm gối đầu nhiều lô):** Hệ thống chủ động ẩn các lô rang đã lưu trữ (archive), tự động tính toán dữ liệu và chỉ hiển thị thông tin của lô rang mới nhất đang được phân phối trên kệ hàng hiện tại.

## 6. Danh mục dữ liệu đầu vào & Liên kết hệ thống

| STT | Trường dữ liệu | Mô tả chi tiết | Nguồn dữ liệu hệ thống | Ví dụ minh họa |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Mã sản phẩm | Định danh duy nhất cho loại sản phẩm | Danh mục sản phẩm (UC-02 / UC-09) | `CF-A-LAMDONG-250G` |
| **2** | Mã lô rang | Mã liên kết trực tiếp tới mẻ rang thành phẩm | UC-06 (Quản lý lô rang - Roast Batch) | `RB-2026-05-001` |
| **3** | Mã lô thu hoạch | Mã liên kết nguồn nguyên liệu thô nhập kho | Bảng quản lý thu mua / Lô nguyên liệu xanh | `HB-2026-03-LD-01` |
| **4** | Thông tin vùng trồng | Tỉnh, khu vực địa lý, độ cao, đặc tính thổ nhưỡng | Danh mục vùng trồng (Cơ sở dữ liệu hệ thống) | Lâm Đồng – Độ cao 1500m, đất đỏ Bazan |
| **5** | Thông tin nông hộ | Tên hộ nông dân hoặc HTX, quy mô, phương pháp chăm sóc | Bảng Quản lý Nông hộ đối tác (Farmers Coop) | Hộ ông Nguyễn Văn A – Hợp tác xã Cầu Đất |
| **6** | Phương pháp sơ chế | Quy trình xử lý hạt cà phê sau khi hái | Thuộc tính của lô thu hoạch thô | Honey Process (Sơ chế mật ong) |
| **7** | Chứng nhận chất lượng | Các tiêu chuẩn, chứng chỉ quốc tế hoặc nội bộ | Bảng Quản lý Chứng nhận (Certifications) | Organic EU, Fair Trade, VietGAP (Còn hiệu lực) |
