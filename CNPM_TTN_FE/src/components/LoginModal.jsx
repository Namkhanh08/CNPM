import {useState, useEffect } from "react";
import useStore from "../store/useStore";
import "./Login.css";
import API from "../services/api";

export default function LoginModal({isOpen, onClose}) {
    const [isActive, setIsActive] = useState(false);
    const setUser = useStore((state) => state.setUser);
    const loadCart = useStore((state) => state.loadCart);
    const loadOrder = useStore((state) => state.fetchOrders);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.login({ username, password });
            const data = res.data;

            localStorage.setItem("token", data.token);

            setUser({
                id: data.userId,
                userName: data.userName,
                name: data.name,
                role: data.position,
                phone: data.phone,
            });

            await loadCart();
            await loadOrder();
            onClose();
        } catch (err) {
            // axios ném lỗi khi status != 2xx
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
            alert(msg);
            console.error("Lỗi đăng nhập:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setIsActive(false);
            setUsername("");
            setPassword("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`login-container ${isActive ? "active" : ""}`}
            >
                {/* Đăng ký */}
                <div className="form-container sign-up">
                    <form>
                        <h1>Tạo tài khoản</h1>
                        <input placeholder="Tên đăng ký" />
                        <input placeholder="Email" />
                        <input placeholder="Mật khẩu"/>
                        <button>Đăng ký</button>
                    </form>
                </div>  

                {/* Đăng nhập */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        <h1>Đăng nhập</h1>
                        <input placeholder="Tài khoản" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button disabled={loading}>{loading ? "Đang đăng nhập" : "Đăng nhập"}</button>
                    </form>
                </div>

                {/* Panel chuyển đổi */}
                <div className="toggle-container">
                    <div className="toggle">

                        <div className="toggle-panel toggle-left">
                            <h1>Chào mừng quay trở lại</h1>
                            <button onClick={() => setIsActive(false)}>
                                Đăng nhập
                            </button>
                        </div>

                        <div className="toggle-panel toggle-right">
                            <h1>Xin chào, bạn!</h1>
                            <button onClick={() => setIsActive(true)}>
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>

                {/*Close button*/}
                <button onClick={onClose} style={{position: 'absolute' , top: '10px' , right:'10px',
                    zIndex: 9999, padding: '5px 10px'
                }}> X </button>
            </div>
        </div>
    );
}
