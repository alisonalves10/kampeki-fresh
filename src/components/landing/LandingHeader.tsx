import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para Restaurantes", href: "#beneficios-restaurantes" },
  { label: "Restaurantes", href: "/restaurantes" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

type AppRole = "admin" | "lojista" | "user";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setUserRole((data?.role as AppRole) || "user");
        });
    } else {
      setUserRole(null);
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  const getDestination = () => {
    switch (userRole) {
      case "admin":
        return "/painel/superadmin";
      case "lojista":
        return "/painel/restaurante";
      default:
        return "/login";
    }
  };

  const getButtonLabel = () => {
    switch (userRole) {
      case "admin":
        return "Painel Admin";
      case "lojista":
        return "Meu Restaurante";
      default:
        return "Entrar";
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container-landing">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">D</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Delivery<span className="text-primary">2U</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user && (userRole === "admin" || userRole === "lojista") ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to={getDestination()}>{getButtonLabel()}</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button onClick={() => handleNavClick("#lead-form")} className="glow-primary">
                  Quero vender com a Delivery2U
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-fade-in">
          <div className="container-landing py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left py-3 px-4 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-2">
              {user && (userRole === "admin" || userRole === "lojista") ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to={getDestination()}>{getButtonLabel()}</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full gap-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button
                    className="w-full glow-primary"
                    onClick={() => handleNavClick("#lead-form")}
                  >
                    Quero vender com a Delivery2U
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
