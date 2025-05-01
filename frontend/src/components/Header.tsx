import { Link, useLocation } from "react-router-dom";
import { Car, Users } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Car className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">CarroVendido</h1>
          </div>
          <nav className="flex space-x-1 sm:space-x-4">
            <NavLink 
              to="/" 
              isActive={location.pathname === "/"} 
              label="Veículos Disponíveis"
            />
            <NavLink 
              to="/sold-vehicles" 
              isActive={location.pathname === "/sold-vehicles"} 
              label="Veículos Vendidos"
            />
            <NavLink 
              to="/add-vehicle" 
              isActive={location.pathname === "/add-vehicle"} 
              label="Cadastrar Veículo"
            />
            <NavLink 
              to="/sellers" 
              isActive={location.pathname.startsWith("/sellers")} 
              label="Vendedores" 
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  label: string;
}

const NavLink = ({ to, isActive, label }: NavLinkProps) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? "bg-primary-foreground text-primary" 
        : "text-primary-foreground hover:bg-white/10"
    }`}
  >
    {label}
  </Link>
);

export default Header;
