export default function Field({ label, value, highlight }) {
    return (
        <div className="p-4 rounded-xl border hover:shadow-md transition-all">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-lg font-semibold ${
                highlight ? "text-accent-1" : "text-gray-800"
            }`}>
                {value || "Chưa cập nhật"}
            </p>
        </div>
    );
}
