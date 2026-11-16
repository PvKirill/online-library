import { BrowserRouter, Routes, Route } from "react-router-dom";

import BooksPage from "./pages/BooksPage";
import BookPage from "./pages/BookPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;