import React, { useState } from 'react';
import { useSiteContent } from '../context/SiteContentContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { siteContent } = useSiteContent();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const school = siteContent?.school;
  const contact = siteContent?.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in" id="contact-page">
      {/* Header Banner */}
      <div className="bg-[#0B1F4D] text-white p-8 md:p-12 rounded-3xl text-center space-y-2 shadow-lg">
        <span className="bg-[#F5B301] text-[#0B1F4D] text-xs font-bold px-3 py-1 rounded-full uppercase">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black">
          Contact {school?.shortName || 'S.A. Public School'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
          We welcome parents and guardians to visit our campus, enquire about admissions, transport routes, and academic programs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Information & Office Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-[#0B1F4D] border-b pb-3">
              School Administrative Office
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Campus Location</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5 whitespace-pre-line">
                    {school?.address ||
                      `Swami Adgadanand Public School,\nMain Highway Road, Phulpur / Varanasi Sector,\nUttar Pradesh - 221002, India`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Telephone / WhatsApp Hotline</p>
                  <a
                    href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                    className="text-slate-800 hover:text-emerald-700 font-semibold mt-0.5 inline-block"
                  >
                    {school?.phone || '+91 9415754349'}
                  </a>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    (Direct helpline for admissions, fees & transport)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Official Email</p>
                  <a
                    href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`}
                    className="text-blue-700 hover:underline font-semibold mt-0.5 inline-block"
                  >
                    {school?.email || 'sapublicschool21@gmail.com'}
                  </a>
                  <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                    (Direct response for admissions & student enquiries)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Assistance & Helpline</p>
                  <p className="text-amber-700 font-semibold mt-0.5">{school?.helpSpanText || '24hr Support Line'}</p>
                  <p className="text-slate-500 text-[11px]">{contact?.officeHours || 'Direct communication for parent queries'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`tel:${(school?.phone || '+91 9415754349').replace(/\s+/g, '')}`}
                className="flex-1 min-w-[130px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call / WhatsApp
              </a>
              <a
                href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`}
                className="flex-1 min-w-[130px] py-2 px-3 bg-[#0B1F4D] hover:bg-[#14327a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Mail className="w-3.5 h-3.5" /> Email Desk
              </a>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-[#0B1F4D] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00AEEF]" />
                Institutional Portal
              </p>
              <p className="text-slate-600 text-[11px]">
                Co-educational institution catering to {school?.academicLevels || 'Class 1 through Class 12'}.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-[#0B1F4D]">
              Send Us a Direct Message
            </h3>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3 animate-in zoom-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Thank You for Reaching Out!</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  We have received your message. Our administrative desk will review your enquiry and respond to {formData.phone} {formData.email ? `/ ${formData.email}` : ''} promptly. You can also write to us directly at <a href={`mailto:${school?.email || 'sapublicschool21@gmail.com'}`} className="text-blue-700 underline font-semibold">{school?.email || 'sapublicschool21@gmail.com'}</a>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                  }}
                  className="bg-[#0B1F4D] text-white text-xs font-bold px-4 py-2 rounded-lg mt-2"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" id="public-contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar Mishra"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#0B1F4D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98380 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#0B1F4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#0B1F4D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject / Enquiry Type
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#0B1F4D]"
                    >
                      <option value="">Select inquiry topic...</option>
                      <option value="Admission">New Admission (Classes 1-12)</option>
                      <option value="Transport">School Van / Transport Route</option>
                      <option value="Fees">Fee Structure & Counter Inquiry</option>
                      <option value="Certificates">Student Registration / Transfer Certificate</option>
                      <option value="General">General Query</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please write your questions regarding admissions, transport stops, or class details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-[#0B1F4D]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#0B1F4D] hover:bg-[#14327a] text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit Inquiry Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Google Map Interactive Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F4D]">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Interactive Campus Location Map</span>
          </div>
          <span className="text-[11px] text-slate-500">Phulpur, Varanasi - Prayagraj Highway, Uttar Pradesh</span>
        </div>
        <div className="w-full h-72 sm:h-96 relative bg-slate-200">
          <iframe
            title="Swami Adgadanand Public School Map Location"
            src={
              contact?.mapEmbedUrl ||
              'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115408.23230671378!2d82.9087063!3d25.321684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db76febcf4d%3A0x68131710853ff0b5!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
