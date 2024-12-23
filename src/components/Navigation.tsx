import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/black-hole", label: "Event Horizon" },
    { href: "/asteroid", label: "The Harbinger" },
    { href: "/timeline", label: "Timeline" },
    { href: "/chapters", label: "Chapters" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-space-black/80 backdrop-blur-lg border-b border-space-blue/20">
      <div className="container mx-auto px-6 py-4">
        <ul className="flex items-center space-x-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  "relative text-gray-400 hover:text-white transition-colors",
                  location.pathname === link.href && "text-white"
                )}
              >
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-space-blue"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;