"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Shield, Mail, ExternalLink } from "lucide-react"

const sections = [
  {
    title: "Information Collection and Use",
    content: [
      "The Application collects information when you download and use it. This information may include:",
    ],
    bullets: [
      "Your device's Internet Protocol address (e.g. IP address)",
      "The pages of the Application that you visit, the time and date of your visit, the time spent on those pages",
      "The time spent on the Application",
      "The operating system you use on your mobile device",
    ],
    extra: [
      "The Application does not gather precise information about the location of your mobile device.",
      "The Application uses Artificial Intelligence (AI) technologies to enhance user experience and provide certain features. The AI components may process user data to deliver personalized content, recommendations, or automated functionalities. All AI processing is performed in accordance with this privacy policy and applicable laws.",
      "For a better experience, while using the Application, the Service Provider may require you to provide certain personally identifiable information, including but not limited to Device or other IDs. The information requested will be retained and used as described in this privacy policy.",
    ],
  },
  {
    title: "Third Party Access",
    content: [
      "Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application. The Service Provider may share your information with third parties as described in this privacy statement.",
      "The Application utilizes third-party services that have their own Privacy Policy about handling data:",
    ],
    links: [
      { label: "Google Analytics for Firebase", url: "https://firebase.google.com/support/privacy" },
      { label: "Firebase Crashlytics", url: "https://firebase.google.com/support/privacy/" },
    ],
    extra: [
      "The Service Provider may disclose User Provided and Automatically Collected Information as required by law, when necessary to protect rights or safety, investigate fraud, or respond to a government request.",
    ],
  },
  {
    title: "Opt-Out Rights",
    content: [
      "You can stop all collection of information by the Application easily by uninstalling it. You may use the standard uninstall processes available as part of your mobile device or via the mobile application marketplace.",
    ],
  },
  {
    title: "Data Retention Policy",
    content: [
      "The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. If you'd like them to delete User Provided Data, please contact them at contact.mediseenapp@gmail.com and they will respond in a reasonable time.",
    ],
  },
  {
    title: "Children",
    content: [
      "The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.",
      "The Application does not address anyone under the age of 13. The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider discovers that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers.",
      "If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider so that they will be able to take the necessary actions.",
    ],
  },
  {
    title: "Security",
    content: [
      "The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.",
    ],
  },
  {
    title: "Changes",
    content: [
      "This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.",
      "This privacy policy is effective as of 2026-03-24.",
    ],
  },
  {
    title: "Your Consent",
    content: [
      "By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-32 space-y-12">

      {/* Back */}
      <Link
        href="/home"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-violet/10 border border-pastel-violet/20 text-pastel-violet text-xs font-black uppercase tracking-widest">
          <Shield className="w-3.5 h-3.5" />
          Legal
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-400 font-medium">
          Effective date: <span className="font-bold text-slate-600">March 24, 2026</span>
        </p>
        <p className="text-slate-500 font-medium leading-relaxed">
          This privacy policy applies to the <span className="font-bold text-slate-700">Mediseen</span> app for mobile devices,
          created as a free service. This service is intended for use "AS IS".
        </p>
      </motion.div>

      {/* External link */}
      <a
        href="https://sites.google.com/view/sapappsolutionmediseenpolicy/home"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-pastel-violet hover:text-pastel-violet transition-all"
      >
        <ExternalLink className="w-4 h-4" />
        View full policy on web
      </a>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-4 pb-10 border-b border-slate-100 last:border-0"
          >
            <h2 className="text-lg font-black text-slate-800">{section.title}</h2>

            {section.content?.map((p, j) => (
              <p key={j} className="text-slate-500 font-medium leading-relaxed text-sm">{p}</p>
            ))}

            {section.bullets && (
              <ul className="space-y-2 pl-2">
                {section.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-pastel-violet mt-2 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {section.links && (
              <ul className="space-y-2 pl-2">
                {section.links.map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-pastel-violet hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {section.extra?.map((p, j) => (
              <p key={j} className="text-slate-500 font-medium leading-relaxed text-sm">{p}</p>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Contact */}
      <div className="p-8 rounded-2xl bg-pastel-violet/5 border border-pastel-violet/10 space-y-3">
        <h3 className="font-black text-slate-800">Contact Us</h3>
        <p className="text-sm text-slate-500 font-medium">
          If you have any questions regarding privacy while using the Application, or have questions about our practices, please contact us.
        </p>
        <a
          href="mailto:contact.mediseenapp@gmail.com"
          className="inline-flex items-center gap-2 text-sm font-bold text-pastel-violet hover:underline"
        >
          <Mail className="w-4 h-4" />
          contact.mediseenapp@gmail.com
        </a>
      </div>

    </div>
  )
}
