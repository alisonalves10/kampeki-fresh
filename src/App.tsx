import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MarketplaceCartProvider } from "./context/MarketplaceCartContext";

// Landing & Public Pages
import LandingPage from "./pages/landing/LandingPage";
import RestaurantsList from "./pages/public/RestaurantsList";
import RestaurantPage from "./pages/public/RestaurantPage";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";

// Tenant Pages (new /r/:slug routes)
import TenantLayout from "./components/tenant/TenantLayout";
import TenantSitePage from "./pages/tenant/TenantSitePage";
import TenantCartPage from "./pages/tenant/TenantCartPage";
import TenantCheckoutPage from "./pages/tenant/TenantCheckoutPage";
import OrderTrackingPage from "./pages/tenant/OrderTrackingPage";

// Auth & User Pages
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// Panel Pages
import PanelRedirect from "./pages/painel/PanelRedirect";
import ClientPanelLayout from "./pages/painel/cliente/ClientPanelLayout";
import ClientOrdersPage from "./pages/painel/cliente/ClientOrdersPage";
import ClientAddressesPage from "./pages/painel/cliente/ClientAddressesPage";
import ClientPointsPage from "./pages/painel/cliente/ClientPointsPage";
import ClientProfilePage from "./pages/painel/cliente/ClientProfilePage";
import RestaurantPanelRedirect from "./pages/painel/restaurante/RestaurantPanelRedirect";
import SuperAdminPanelRedirect from "./pages/painel/superadmin/SuperAdminPanelRedirect";

// Admin Pages (legacy - being migrated to panels)
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAddons from "./pages/admin/AdminAddons";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/admin/AdminReports";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <MarketplaceCartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Landing & Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/restaurantes" element={<RestaurantsList />} />
                  <Route path="/restaurante/:slug" element={<RestaurantPage />} />
                  <Route path="/termos" element={<TermsPage />} />
                  <Route path="/privacidade" element={<PrivacyPage />} />
                  
                  {/* Tenant Routes (whitelabel) */}
                  <Route path="/r/:slug" element={<TenantLayout />}>
                    <Route index element={<TenantSitePage />} />
                    <Route path="carrinho" element={<TenantCartPage />} />
                    <Route path="checkout" element={<TenantCheckoutPage />} />
                  </Route>
                  
                  {/* Order Tracking */}
                  <Route path="/pedido/:id" element={<OrderTrackingPage />} />
                  
                  {/* Auth */}
                  <Route path="/login" element={<Auth />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Legacy User Routes */}
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Panel Routes */}
                  <Route path="/painel" element={<PanelRedirect />} />
                  <Route path="/painel/cliente" element={<ClientPanelLayout />}>
                    <Route index element={<ClientOrdersPage />} />
                    <Route path="enderecos" element={<ClientAddressesPage />} />
                    <Route path="pontos" element={<ClientPointsPage />} />
                    <Route path="perfil" element={<ClientProfilePage />} />
                  </Route>
                  <Route path="/painel/restaurante" element={<RestaurantPanelRedirect />} />
                  <Route path="/painel/superadmin" element={<SuperAdminPanelRedirect />} />
                  
                  {/* Admin/Lojista Panel (legacy) */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="addons" element={<AdminAddons />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </MarketplaceCartProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
