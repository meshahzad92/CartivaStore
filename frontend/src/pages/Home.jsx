import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getTestimonials } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const whyChooseUs = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: 'Premium Quality',
        description: 'Every product is crafted from the finest materials with meticulous attention to detail.'
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
        ),
        title: 'Fast Shipping',
        description: 'Free delivery on orders over $100. Standard shipping within 3-5 business days.'
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
            </svg>
        ),
        title: 'Easy Returns',
        description: '30-day hassle-free return policy. No questions asked — your satisfaction guaranteed.'
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
        title: '24/7 Support',
        description: 'Dedicated customer support team ready to assist you at any time, anywhere.'
    }
];

function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-primary' : 'text-muted'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function Home() {
    const [featured, setFeatured] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getProducts(), getTestimonials()])
            .then(([products, reviews]) => {
                setFeatured(products.slice(0, 8));
                setTestimonials(reviews);
            })
            .catch((err) => console.error('Failed to load homepage data:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="max-w-2xl">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-6">
                            New Collection 2026
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                            Elevate Your
                            <span className="text-primary block">Everyday Style</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                            Discover curated essentials designed for the modern individual. Premium craftsmanship meets contemporary design.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="/products">
                                <Button size="lg">
                                    Shop Now
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button variant="outline" size="lg">Our Story</Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
                        <p className="text-muted-foreground mt-2">Handpicked for you this season</p>
                    </div>
                    <Link
                        to="/products"
                        className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                        View All
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </Link>
                </div>
                {loading ? <Loader /> : <ProductGrid products={featured} />}
            </section>

            {/* Why Choose Us */}
            <section className="bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground">Why Choose Cartiva?</h2>
                        <p className="text-muted-foreground mt-2">What sets us apart from the rest</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyChooseUs.map((item, i) => (
                            <div
                                key={i}
                                className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
                            >
                                <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground">What Our Customers Say</h2>
                    <p className="text-muted-foreground mt-2">Real reviews from real people</p>
                </div>
                {loading ? (
                    <Loader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.id}
                                className="p-6 bg-card rounded-xl border border-border hover:shadow-md transition-shadow"
                            >
                                <StarRating rating={t.rating} />
                                <p className="mt-4 text-card-foreground/80 text-sm leading-relaxed">{t.comment}</p>
                                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-card-foreground">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>


        </div>
    );
}

export default memo(Home);
