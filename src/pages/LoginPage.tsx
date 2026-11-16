import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка авторизации"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Вход администратора</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;