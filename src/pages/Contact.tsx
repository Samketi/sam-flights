// src/pages/Contact.tsx
import { useState, type FC, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  CheckCircle,
} from "lucide-react";

const Contact: FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "+27 11 123 4567",
      subtext: "Mon-Fri 8am-8pm, Sat-Sun 9am-5pm",
    },
    {
      icon: Mail,
      title: "Email",
      details: "support@skybooker.com",
      subtext: "We'll respond within 24 hours",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "123 Sandton Drive, Johannesburg",
      subtext: "Gauteng, South Africa",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "24/7 Online Support",
      subtext: "Always here to help",
    },
  ];

  const faqs = [
    {
      question: "How can I change my booking?",
      answer:
        "You can modify your booking by logging into your account and going to 'My Bookings'. Select the booking you want to change and follow the modification process. Changes may be subject to airline fees.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Cancellation policies vary by airline and fare type. You can cancel confirmed bookings from the 'My Bookings' section. Refund eligibility depends on the airline's terms and conditions.",
    },
    {
      question: "How do I know my booking is confirmed?",
      answer:
        "You'll receive a confirmation email immediately after successful payment with your booking reference number. You can also check your booking status in the 'My Bookings' section.",
    },
    {
      question: "Do you charge any booking fees?",
      answer:
        "No, we don't charge any hidden fees. The price you see is the total price including all taxes and fees from the airline.",
    },
    {
      question: "How secure is my payment?",
      answer:
        "All payments are processed through Paystack, a PCI-DSS compliant payment gateway. Your payment information is encrypted and secure.",
    },
    {
      question: "Can I book for someone else?",
      answer:
        "Yes, you can book flights for other passengers. Just enter their details during the booking process. Make sure the names match their travel documents exactly.",
    },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSubmitted(true);
    setLoading(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto"
          >
            Have a question? We're here to help. Reach out to our team and we'll
            get back to you as soon as possible.
          </motion.p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {info.title}
              </h3>
              <p className="text-gray-900 font-semibold mb-1">{info.details}</p>
              <p className="text-sm text-gray-600">{info.subtext}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Send us a Message
                </h2>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll get back to you within 24
                    hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="cancellation">Cancellation</option>
                      <option value="refund">Refund Request</option>
                      <option value="technical">Technical Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                <a
                  href="/my-bookings"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  → View My Bookings
                </a>
                <a
                  href="/about"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  → About Us
                </a>
                <a
                  href="/"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  → Search Flights
                </a>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Emergency Support
              </h3>
              <p className="text-sm text-red-800 mb-3">
                For urgent travel issues or same-day flight problems:
              </p>
              <a
                href="tel:+27111234567"
                className="block bg-red-600 text-white text-center font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Call +27 11 123 4567
              </a>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <summary className="font-bold text-gray-900 text-lg list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-blue-600 text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </div>

      {/* Map Section (Optional - placeholder) */}
      <div className="bg-gray-200 h-96 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Visit Our Office
            </h3>
            <p className="text-gray-600">
              123 Sandton Drive, Johannesburg
              <br />
              Gauteng, South Africa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
