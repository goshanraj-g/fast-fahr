import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { MenuProvider } from "./components/MenuContext";
import Header from "./components/Header";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import BookmarksPage from "./pages/BookmarksPage";
import BuyingPage from "./pages/BuyingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MessagesPage from "./pages/MessagesPage";
import RegisterPage from "./pages/RegisterPage";
import ResetCodePage from "./pages/ResetCodePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SellingPage from "./pages/SellingPage";
import AccountPage from "./pages/AccountPage";

/**
* The root component of the FastFahr application.
* Initializes the router, authentication context, and defines routes for all pages.
* @returns {JSX.Element} The main application structure with routing.
*/
function AppContent() {
  const location = useLocation();
  const noLayoutRoutes = ["/login", "/register", "/forgot-password", "verify-code", "reset-password"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <NavBar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/buying" element={<BuyingPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/selling" element={<SellingPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-code" element={<ResetCodePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router basename="/fastfahr">
      <AuthProvider>
        <MenuProvider>
          <AppContent />
        </MenuProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;