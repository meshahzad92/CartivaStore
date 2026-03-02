import { useState, memo } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const contactInfo = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
        title: 'Email',
        detail: 'support@cartiva.com',
        subtext: 'We reply within 24 hours'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
        ),
        title: 'Phone',
        detail: '+1 (555) 123-4567',
        subtext: 'Mon-Fri, 9 AM – 6 PM EST'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
        ),
        title: 'Address',
        detail: '123 Commerce St, Suite 400',
        subtext: 'New York, NY 10001'
    }
];

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Get in Touch</h1>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Have a question or feedback? We'd love to hear from you.
                </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {contactInfo.map((info, i) => (
                    <div key={i} className="p-6 bg-card rounded-xl border border-border text-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            {info.icon}
                        </div>
                        <h3 className="font-semibold text-card-foreground">{info.title}</h3>
                        <p className="text-sm text-foreground mt-1">{info.detail}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{info.subtext}</p>
                    </div>
                ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-card-foreground">Message Sent!</h3>
                            <p className="text-muted-foreground mt-2">We'll get back to you as soon as possible.</p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => setSubmitted(false)}
                            >
                                Send Another Message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-lg font-semibold text-card-foreground mb-6">Send us a Message</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Name"
                                    id="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your name"
                                />
                                <Input
                                    label="Email"
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                />
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Subject"
                                        id="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="message" className="text-sm font-medium text-foreground mb-1.5 block">
                                        Message <span className="text-destructive">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Tell us more..."
                                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <Button type="submit" size="lg" className="w-full mt-6">
                                Send Message
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(Contact);
