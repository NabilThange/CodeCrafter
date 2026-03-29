"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/vane", label: "Vane" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/monitor", label: "Monitor" },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <ul className="flex gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`hover:text-blue-600 transition-colors ${
                  pathname === link.href ? "font-bold text-blue-600" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
