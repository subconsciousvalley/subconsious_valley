"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Globe,
  Star,
  Award,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";

export default function About({ t: propT }) {
  const { t: hookT } = useLanguage();
  const t = propT || hookT; // Use prop if provided, fallback to hook
  const router = useRouter();

  const values = [
    {
      icon: Heart,
      title: t("value_1_title"),
      description: t("value_1_desc"),
    },
    {
      icon: Brain,
      title: t("value_2_title"),
      description: t("value_2_desc"),
    },
    {
      icon: Globe,
      title: t("value_3_title"),
      description: t("value_3_desc"),
    },
    {
      icon: Star,
      title: t("value_4_title"),
      description: t("value_4_desc"),
    },
  ];

  const credentials = [
    "Certified NLP Practitioner",
    "Licensed Hypnotherapy Specialist",
    "Trauma-Informed Therapy Training",
    "Multilingual Therapeutic Communication",
    "Mind-Body Wellness Certification",
    "Advanced Subconscious Reprogramming",
  ];

  const journey = [
    {
      year: "2017",
      title: t("journey_1_title"),
      description: t("journey_1_desc"),
    },
    {
      year: "2020",
      title: t("journey_2_title"),
      description: t("journey_2_desc"),
    },
    {
      year: "2023",
      title: t("journey_3_title"),
      description: t("journey_3_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-teal-100 text-teal-800 mb-6">
                {t("about")}
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("about_hero_title")}
                </span>
                <br />
                <span className="text-slate-800">
                  {t("about_hero_title_2")}
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {t("about_hero_desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white cursor-pointer"
                  onClick={() => router.push("/#contact-section")}
                >
                  {t("start_your_transformation")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/sessions">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                  >
                    {t("explore_programs")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <Image
                  src="https://cdn.subconsciousvalley.workers.dev/founderImage.jpg"
                  alt="Vanita Pande - Founder"
                  width={600}
                  height={800}
                  className="rounded-2xl shadow-2xl"
                  priority
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQAAP/2Q=="
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-sm font-semibold text-slate-800">
                    Founded 2023
                  </p>
                  <p className="text-xs text-slate-500">Dubai, UAE</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-800">
              {t("story_behind_title")}
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              {t("story_behind_desc")}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="prose prose-lg max-w-none">
                <div className="bg-teal-50 p-8 rounded-2xl border-l-4 border-teal-500 mb-8">
                  <p className="text-lg text-slate-700 italic leading-relaxed mb-0">
                    "{t("founder_about_quote")}"
                  </p>
                  <p className="text-right mt-4 font-semibold text-teal-700">
                    — Vanita Pande
                  </p>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  {t("why_multilingual_matters")}
                </h3>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  {t("why_multilingual_p1")}
                </p>

                <p className="text-slate-700 mb-6 leading-relaxed">
                  {t("why_multilingual_p2")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Vanita Pande
                    </h3>
                    <p className="text-slate-600">{t("founder_title")}</p>
                  </div>

                  <h4 className="font-semibold text-slate-800 mb-3">
                    {t("certifications_training")}
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {credentials.map((credential) => (
                      <li key={credential} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 mr-2 shrink-0" />
                        <span className="text-sm text-slate-700">
                          {credential}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 rounded-lg text-white text-center">
                    <p className="font-semibold">
                      500+ {t("lives_transformed")}
                    </p>
                    <p className="text-sm text-teal-100">
                      {t("across_countries")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0">
                <CardContent className="p-6">
                  <h4 className="font-bold text-slate-800 mb-4">
                    {t("languages_we_heal_in")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["English", "हिंदी", "العربية"].map((lang) => (
                      <Badge
                        key={lang}
                        className="justify-center bg-white/80 text-slate-700"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <Badge variant="outline" className="text-slate-600">
                      {t("many_more")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Co-Founder Section */}
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <Image
                  src="https://cdn.subconsciousvalley.workers.dev/coFounderImage.jpg"
                  alt="Sara - Co-Founder"
                  width={430}
                  height={100}
                  className="rounded-2xl shadow-2xl"
                  // style={{ maxWidth: '100%', height: 'auto' }}
                  priority
                  quality={85}
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-sm font-semibold text-slate-800">
                    Co-Founder
                  </p>
                  {/* <p className="text-xs text-slate-500">Age 15</p> */}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-purple-100 text-purple-800 mb-6">
                {t("co_founder")}
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("meet_cofounder")}
                </span>
                <br />
                <span className="text-slate-800">{t("young_visionary")}</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {t("about_cofounder")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-purple-500 text-white">
                  Access Bars Practitioner
                </Badge>
                <Badge className="bg-pink-500 text-white">Energy Healing</Badge>
                <Badge className="bg-violet-500 text-white">
                  Audio Content Creator
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Awards and Recognition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                {t("awards_recognition")}
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                 {t("awards_desc")}
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                   {t("awards_desc_2")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Image
                src="https://cdn.subconsciousvalley.workers.dev/AWARDS.jpeg"
                alt="Professional Excellence Awards for Global Wellness Innovation 2025"
                width={600}
                height={800}
                className="rounded-2xl shadow-2xl w-full h-auto"
                style={{ maxWidth: '100%', height: 'auto' }}
                quality={85}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-100 text-teal-800 mb-4">
              Client Success Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Trusted by Industry Leaders
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Leading organizations worldwide trust Subconscious Valley to transform their teams' wellbeing and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Dr. Sarah Mitchell",
                title: "Chief Medical Officer",
                company: "Emirates Healthcare Group",
                location: "Dubai, UAE",
                rating: 5.0,
                testimonial: "We integrated Subconscious Valley's wellness programs into our employee benefits package. The measurable improvement in staff wellbeing and productivity has been remarkable. Our employee satisfaction scores increased by 34% within 6 months.",
                avatar: "SM",
                verified: true
              },
              {
                name: "Ahmed Al-Rashid",
                title: "VP of Human Resources",
                company: "Saudi Aramco",
                location: "Riyadh, KSA",
                rating: 4.9,
                testimonial: "The Arabic hypnotherapy sessions have been transformative for our workforce. We've seen a 45% reduction in stress-related sick days and significantly improved team morale. The cultural sensitivity in the content is exceptional.",
                avatar: "AR",
                verified: true
              },
              {
                name: "Priya Sharma",
                title: "Director of Wellness",
                company: "Tata Consultancy Services",
                location: "Mumbai, India",
                rating: 4.8,
                testimonial: "Our partnership with Subconscious Valley has revolutionized our corporate wellness strategy. The Hindi sessions resonate deeply with our employees, and we've documented a 28% improvement in work-life balance metrics.",
                avatar: "PS",
                verified: true
              },
              {
                name: "Michael Thompson",
                title: "CEO",
                company: "Gulf Innovation Hub",
                location: "Abu Dhabi, UAE",
                rating: 4.9,
                testimonial: "As a leader managing high-stress environments, these sessions have been invaluable. My executive team reports better decision-making clarity and emotional resilience. ROI on employee wellness has exceeded expectations.",
                avatar: "MT",
                verified: true
              },
              {
                name: "Lisa Chen",
                title: "Head of People Operations",
                company: "Singapore Tech Solutions",
                location: "Singapore",
                rating: 4.7,
                testimonial: "The multilingual approach has been game-changing for our diverse workforce. Employee engagement scores have increased by 42% since implementing these wellness programs across our organization.",
                avatar: "LC",
                verified: true
              },
              {
                name: "Roberto Martinez",
                title: "Wellness Director",
                company: "Global Finance Corp",
                location: "London, UK",
                rating: 4.8,
                testimonial: "The stress management sessions have transformed our high-pressure work environment. We've seen a 38% reduction in burnout rates and significantly improved team collaboration and productivity.",
                avatar: "RM",
                verified: true
              },
              {
                name: "Dr. Fatima Al-Zahra",
                title: "Chief Wellness Officer",
                company: "Qatar National Bank",
                location: "Doha, Qatar",
                rating: 5.0,
                testimonial: "The Arabic sessions have been particularly impactful for our regional teams. We've documented improved mental health metrics and a 45% increase in employee satisfaction with our wellness initiatives.",
                avatar: "FZ",
                verified: true
              },
              {
                name: "James Wilson",
                title: "VP of Employee Experience",
                company: "Australian Mining Group",
                location: "Perth, Australia",
                rating: 4.6,
                testimonial: "Working in high-stress mining operations, mental wellness is crucial. These sessions have helped our teams manage stress better, resulting in improved safety records and team morale.",
                avatar: "JW",
                verified: true
              },
              {
                name: "Elena Rodriguez",
                title: "Chief People Officer",
                company: "Madrid Financial Services",
                location: "Madrid, Spain",
                rating: 4.8,
                testimonial: "The multilingual wellness approach has been revolutionary for our European operations. We've seen remarkable improvements in cross-cultural team dynamics and overall employee satisfaction.",
                avatar: "ER",
                verified: true
              },

            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}

              >
                <Card className="h-full bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        {/* <p className="text-sm font-medium text-teal-600">{testimonial.title}</p> */}
                        {/* <p className="text-sm text-slate-500">{testimonial.company}</p> */}
                      </div>
                    </div>
                    
                    <blockquote className="text-slate-700 leading-relaxed mb-4 relative">
                      <span className="text-4xl text-teal-200 absolute -top-2 -left-2">"</span>
                      <p className="relative z-10 pl-6">{testimonial.testimonial}</p>
                    </blockquote>
                    
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < Math.floor(testimonial.rating) 
                              ? 'fill-current text-amber-400' 
                              : 'text-slate-300'
                          }`} 
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-slate-700">{testimonial.rating}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-sm text-slate-500">{testimonial.location}</span>
                      <Badge className="bg-slate-100 text-slate-600 text-xs">
                        Enterprise Client
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-800">
              {t("our_core_values")}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t("core_values_desc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-800">
              {t("our_journey")}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t("our_journey_desc")}
            </p>
          </motion.div>

          <div className="relative perspective-1000">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-teal-400 via-emerald-500 to-teal-600 shadow-lg"></div>

            <div className="space-y-16">
              {journey.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{
                    opacity: 0,
                    x: index % 2 === 0 ? -100 : 100,
                    rotateY: index % 2 === 0 ? -15 : 15,
                    z: -50,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    z: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: index * 0.3,
                    type: "spring",
                    stiffness: 100,
                  }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className={`lg:w-1/2 ${
                      index % 2 === 0 ? "lg:pr-16" : "lg:pl-16"
                    }`}
                  >
                    <motion.div
                      whileHover={{
                        rotateY: index % 2 === 0 ? 5 : -5,
                        rotateX: -2,
                        z: 20,
                        scale: 1.02,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="group cursor-pointer"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Card className="relative bg-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform-gpu">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-xl" />
                        <CardContent className="relative p-8 z-10">
                          <div className="flex items-center mb-6">
                            <motion.div
                              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
                              whileHover={{ rotateZ: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <span className="text-white font-bold text-lg">
                                {milestone.year.slice(-2)}
                              </span>
                            </motion.div>
                            <div>
                              <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white mb-2 shadow-lg">
                                {milestone.year}
                              </Badge>
                              <div className="text-xs text-slate-500 uppercase tracking-wider">
                                Milestone {index + 1}
                              </div>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-teal-700 transition-colors">
                            {milestone.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed text-lg">
                            {milestone.description}
                          </p>
                          <div className="mt-6 flex items-center text-teal-600">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 mr-3" />
                            <span className="text-sm font-medium">
                              Achievement Unlocked
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div
                    className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full border-4 border-white shadow-2xl z-20"
                    whileHover={{ scale: 1.3, rotateZ: 180 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full animate-ping opacity-30" />
                    <div className="absolute inset-2 bg-white rounded-full" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6">{t("our_mission")}</h3>
                <p className="text-teal-100 text-lg leading-relaxed flex-1">
                  {t("our_mission_desc")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-6">{t("our_vision")}</h3>
                <p className="text-teal-100 text-lg leading-relaxed flex-1">
                  {t("our_vision_desc")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: t("lives_transformed") },
              { number: "6+", label: t("all_languages") },
              { number: "15+", label: t("stat_countries") },
              { number: "95%", label: t("stat_success") },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                  <p className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </p>
                  <p className="text-slate-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-slate-800">
              {t("ready_to_begin")}
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              {t("ready_to_begin_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sessions">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                >
                  {t("explore_collection")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {/* <Link href="/contact"> */}
              <Button
                size="lg"
                variant="outline"
                className="border-teal-200 hover:bg-teal-50 bg-white text-slate-700 hover:text-teal-700"
                onClick={() => router.push("/#contact-section")}
              >
                {t("get_in_touch")}
              </Button>
              {/* </Link> */}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
