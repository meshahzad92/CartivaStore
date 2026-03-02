import { memo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const values = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Our Vision',
        description: 'To redefine modern essentials by blending timeless design with contemporary functionality.'
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
        ),
        title: 'Our Philosophy',
        description: 'Quality over quantity. Every piece in our collection is thoughtfully curated and responsibly made.'
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
        title: 'Sustainability',
        description: 'We partner with ethical manufacturers and use eco-friendly materials wherever possible.'
    }
];

const team = [
    { name: 'Emma Anderson', role: 'Founder & CEO', initials: 'EA' },
    { name: 'Daniel Park', role: 'Creative Director', initials: 'DP' },
    { name: 'Sophia Laurent', role: 'Head of Product', initials: 'SL' },
    { name: 'Marcus Chen', role: 'Operations Lead', initials: 'MC' }
];

function About() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-accent/50 via-background to-secondary/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-4">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                        Crafting the Future of
                        <span className="text-primary block mt-1">Everyday Essentials</span>
                    </h1>
                    <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground leading-relaxed">
                        Founded in 2022, Cartiva was born from a simple belief: everyone deserves access to thoughtfully designed,
                        premium-quality products without the premium price tag.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((val, i) => (
                        <div key={i} className="text-center p-8 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                {val.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-card-foreground mb-3">{val.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{val.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '50K+', label: 'Happy Customers' },
                            { value: '200+', label: 'Products' },
                            { value: '15+', label: 'Countries' },
                            { value: '4.8', label: 'Avg. Rating' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground">Meet Our Team</h2>
                    <p className="text-muted-foreground mt-2">The people behind Cartiva</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {team.map((member, i) => (
                        <div key={i} className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                                {member.initials}
                            </div>
                            <h4 className="font-semibold text-card-foreground">{member.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground">Ready to Upgrade Your Style?</h2>
                    <p className="text-primary-foreground/70 mt-2 max-w-md mx-auto">
                        Explore our latest collection and find your new favorites.
                    </p>
                    <Link to="/products" className="inline-block mt-8">
                        <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                            Shop the Collection
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default memo(About);
