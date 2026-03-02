import { memo } from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
    shop: [
        { to: '/products', label: 'All Products' },
        { to: '/products?category=tops', label: 'Tops' },
        { to: '/products?category=bottoms', label: 'Bottoms' },
        { to: '/products?category=outerwear', label: 'Outerwear' },
        { to: '/products?category=footwear', label: 'Footwear' },
        { to: '/products?category=accessories', label: 'Accessories' }
    ],
    company: [
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
        { to: '/about', label: 'Careers' },
        { to: '/about', label: 'Press' }
    ],
    support: [
        { to: '/contact', label: 'Help Center' },
        { to: '/contact', label: 'Shipping Info' },
        { to: '/contact', label: 'Returns & Exchanges' },
        { to: '/contact', label: 'Size Guide' }
    ]
};

function Footer() {
    return (
        <footer className="bg-foreground text-background">
            {/* Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">C</span>
                            </div>
                            <span className="text-xl font-bold">Cartiva</span>
                        </Link>
                        <p className="text-background/60 text-sm leading-relaxed">
                            Curated essentials for the modern individual. Quality craftsmanship meets contemporary design.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.shop.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.to} className="text-sm text-background/60 hover:text-background transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.company.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.to} className="text-sm text-background/60 hover:text-background transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.support.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.to} className="text-sm text-background/60 hover:text-background transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-background/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-background/50">
                        &copy; {new Date().getFullYear()} Cartiva. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-background/50">Privacy</span>
                        <span className="text-sm text-background/50">Terms</span>
                        <span className="text-sm text-background/50">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default memo(Footer);
