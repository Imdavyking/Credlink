import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ConnectButton } from "thirdweb/react";
import { THIRDWEB_CLIENT } from "../utils/constants";

const NavHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/create-loan", label: "Create" },
    { to: "/loan-list", label: "Loans" },
    { to: "/pay-loan", label: "Pay" },
    { to: "/lock-collateral", label: "Lock" },
  ];

  const renderLinks = (isMobile = false) =>
    links.map(({ to, label }) => (
      <Link
        key={to}
        to={to}
        onClick={isMobile ? () => setMenuOpen(false) : undefined}
        className="text-lg text-gray-700 hover:text-blue-600"
      >
        {label}
      </Link>
    ));

  return (
    <header className="p-6 border-b shadow-sm bg-white flex justify-between items-center mb-6 relative">
      <Link to="/">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
          CredLink
        </h1>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6 items-center">
        {renderLinks()} <ConnectButton client={THIRDWEB_CLIENT} />
      </nav>

      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden space-x-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-700"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col space-y-4 p-4 md:hidden z-50">
          {renderLinks(true)}
          <ConnectButton client={THIRDWEB_CLIENT} />
        </nav>
      )}
    </header>
  );
};

export default NavHeader;
