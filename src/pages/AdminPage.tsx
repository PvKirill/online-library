
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

function AdminPage() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <h1>Панель администратора</h1>

      <button onClick={handleLogout}>
        Выйти
      </button>
    </div>
  );
}

export default AdminPage;
