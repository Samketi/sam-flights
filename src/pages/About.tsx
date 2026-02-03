// src/pages/About.tsx
import { type FC } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Globe,
  Shield,
  Heart,
  Users,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";

const About: FC = () => {
  const stats = [
    { icon: Users, label: "Happy Customers", value: "500K+" },
    { icon: Globe, label: "Destinations", value: "200+" },
    { icon: Plane, label: "Airlines", value: "600+" },
    { icon: Award, label: "Years Experience", value: "10+" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description:
        "Your data and payments are protected with industry-leading security measures. We prioritize your privacy and safety above all else.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description:
        "We're dedicated to providing exceptional service and support. Our team is available 24/7 to help you with any questions or concerns.",
    },
    {
      icon: TrendingUp,
      title: "Best Prices",
      description:
        "We work directly with airlines to bring you competitive prices and exclusive deals. No hidden fees, just transparent pricing.",
    },
    {
      icon: Clock,
      title: "Quick & Easy",
      description:
        "Book your flights in minutes with our streamlined booking process. Simple, fast, and hassle-free travel planning.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      description: "10+ years in travel industry",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      description: "Tech innovation leader",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Customer Success",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      description: "Customer experience expert",
    },
    {
      name: "David Park",
      role: "VP of Operations",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      description: "Global operations specialist",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            About SkyBooker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100"
          >
            Making travel accessible, affordable, and hassle-free for everyone
          </motion.p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>
                Founded in 2014, SkyBooker was born from a simple idea: travel
                should be accessible to everyone. Our founders, passionate
                travelers themselves, noticed the complexity and high costs
                associated with booking flights online.
              </p>
              <p>
                We set out to create a platform that combines cutting-edge
                technology with exceptional customer service. Today, we partner
                with over 600 airlines worldwide to bring you the best deals and
                most convenient booking experience.
              </p>
              <p>
                Our mission goes beyond just booking flights. We're building a
                community of travelers who share our passion for exploration and
                believe that the journey is just as important as the
                destination.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109c055?w=800&h=600&fit=crop"
              alt="Airplane in sky"
              className="rounded-lg shadow-xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-sm">Years of Excellence</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600">
            The people behind your seamless travel experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-semibold mb-2">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied travelers who trust SkyBooker for their
            flight bookings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Book a Flight
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
