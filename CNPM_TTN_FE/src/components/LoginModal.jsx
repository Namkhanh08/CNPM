import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import "./Login.css";
import API from "../services/api";

export default function LoginModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false); // Chuyển đổi giữa Login và Register
    
    // Lấy các hàm từ Store toàn cục
    const setUser = useStore((state) => state.setUser);
    const loadCart = useStore((state) => state.loadCart);
    const loadOrder = useStore((state) => state.fetchOrders);
    
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [regData, setRegData] = useState({ 
        name: "", 
        email: "", 
        username: "", 
        password: "" 
    });

    // Xử lý Đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loginName = username.trim();
            const res = await API.login({
                UserName: loginName,
                Email: loginName,
                Password: password
            });
            const result = res.data;  

            if (result.success) {            
                // 1. Lưu thông tin vào Storage
                localStorage.setItem("token", result.data);
                localStorage.setItem("userId", result.userId);
                localStorage.setItem("userName", result.userName);
                localStorage.setItem("userType", result.userType); 

                // 2. Cập nhật State toàn cục
                setUser({
                    id: result.userId,
                    userName: result.userName,
                    userType: result.userType,
                });   

                // 3. Load dữ liệu người dùng
                await loadCart();
                await loadOrder();
                
                onClose(); // Đóng Modal

                // 4. Điều hướng dựa trên UserType (0: User, 1: Admin, 2: Staff, 3: Stock)
                const role = parseInt(result.userType);
                if (role === 1) {
                    navigate("/admin"); 
                } else if (role === 2) {
                    navigate("/admin/orders"); 
                } else if (role === 3) {
                    navigate("/admin/inventory"); 
                } else {
                    navigate("/"); 
                }
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.register({
                Name: regData.name,
                UserName: regData.username,
                Email: regData.email,
                Password: regData.password,
                UserType: 0 // Mặc định là khách hàng
            });
            
            if (res.data.success) {
                alert("Đăng ký thành công! Hãy đăng nhập.");
                setIsActive(false); // Chuyển sang form Login
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Đăng ký lỗi");
        } finally {
            setLoading(false);
        }
    };

    // Reset form khi đóng/mở modal
    useEffect(() => {
        if (isOpen) {
            setIsActive(false);
            setUsername("");
            setPassword("");
            setRegData({ name: "", email: "", username: "", password: "" });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
            <div onClick={(e) => e.stopPropagation()} className={`login-container ${isActive ? "active" : ""}`}>
                
                {/* Form Đăng ký */}
                <div className="form-container sign-up">
                    <form onSubmit={handleRegister}>
                        <h1>Tạo tài khoản</h1>
                        <input 
                            type="text"
                            placeholder="Họ tên" 
                            required
                            value={regData.name} 
                            onChange={(e) => setRegData({...regData, name: e.target.value})} 
                        />
                        <input 
                            type="email"
                            placeholder="Email" 
                            required
                            value={regData.email} 
                            onChange={(e) => setRegData({...regData, email: e.target.value})} 
                        />
                        <input 
                            type="text"
                            placeholder="Tên đăng nhập" 
                            required
                            value={regData.username} 
                            onChange={(e) => setRegData({...regData, username: e.target.value})} 
                        />
                        <input 
                            type="password" 
                            placeholder="Mật khẩu" 
                            required
                            value={regData.password} 
                            onChange={(e) => setRegData({...regData, password: e.target.value})} 
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </form>
                </div>  

                {/* Form Đăng nhập */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Đăng nhập</h1>
                        <input 
                            type="text"
                            placeholder="Tên đăng nhập" 
                            required
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                        <input 
                            type="password"
                            placeholder="Mật khẩu" 
                            required
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Đang đợi..." : "Đăng nhập"}
                        </button>
                    </form>
                </div>

                {/* Phần chuyển đổi (Overlay) */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Chào mừng trở lại!</h1>
                            <p>Đã có tài khoản? Đăng nhập ngay để tiếp tục.</p>
                            <button onClick={() => setIsActive(false)}>Đăng nhập</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Xin chào!</h1>
                            <p>Bạn chưa có tài khoản? Đăng ký để nhận nhiều ưu đãi.</p>
                            <button onClick={() => setIsActive(true)}>Đăng ký</button>
                        </div>
                    </div>
                </div>

                {/* Nút đóng Modal */}
                <button onClick={onClose} className="close-btn-style"> X </button>
            </div>
        </div>
    );
}
