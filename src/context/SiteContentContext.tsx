import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent } from '../types';

const defaultSiteContent: SiteContent = {
  school: {
    name: 'Swami Adgadanand Public School',
    shortName: 'S.A. Public School',
    tagline: 'Excellence in Value-Based Education',
    motto: 'सा विद्या या विमुक्तये',
    mottoTranslation: 'Knowledge is that which liberates.',
    logoUrl: 'https://i.postimg.cc/HxY8kTx0/school-logo.jpg',
    phone: '+91 9415754349',
    supportPhone: '+91 9415754349',
    email: 'sapublicschool21@gmail.com',
    address: 'Swami Adgadanand Public School Campus, Main Highway Road, Phulpur / Varanasi Sector, Uttar Pradesh - 221002, India',
    helpSpanText: '24hr',
    academicLevels: 'Classes 1st to 12th',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115408.23230671378!2d82.9087063!3d25.321684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2db76febcf4d%3A0x68131710853ff0b5!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  },
  principal: {
    name: 'Mr. Rajesh Kumar Srivastav',
    designation: 'Director of school',
    qualification: '',
    photoUrl: 'https://i.postimg.cc/JhYwFQ9N/Whats-App-Image-2026-09-03-at-2-50-04-PM.jpg',
    welcomeHeadline: 'Empowering Rural & Suburban Youth with Modern Quality Education',
    welcomeMessage: 'Welcome to Swami Adgadanand Public School. We believe true education enlightens the mind while anchoring the spirit in moral character and self-discipline. Our comprehensive curriculum blends rigorous mathematics, science, language arts, and social sciences with digital literacy and physical wellness.',
    deskMessageP1: 'Under the holy inspiration and sacred blessings of Param Pujya Swami Adgadanand Ji Maharaj, S.A. Public School was established to provide children of our region access to world-class schooling, disciplined character development, and academic success.',
    deskMessageP2: 'We believe that true education does not just fill the mind with facts, but kindles the inner light of discernment, curiosity, and moral integrity. Our teachers mentor every student with individual care, fostering curiosity and confidence for board examinations and competitive pursuits.',
  },
  home: {
    heroTitle: 'SWAMI ADGADANAND PUBLIC SCHOOL',
    heroSubtitle: 'Nurturing moral wisdom, scientific temperament, and academic excellence under the venerable inspiration of Param Pujya Swami Adgadanand Ji Maharaj.',
    statStudents: '250+',
    statPassRate: '100%',
    statTeachers: '15+',
    statVans: '6',
    admissionBannerTitle: 'Admissions Open for Classes 1st to 12th',
    admissionBannerSubtitle: 'Enroll your child at Swami Adgadanand Public School for quality education, affordable fee structure, and dedicated academic guidance.',
  },
  about: {
    pageTitle: 'About S.A. Public School',
    pageSubtitle: 'Founded under the eternal inspiration of Param Pujya Swami Adgadanand Ji Maharaj, fostering character, wisdom, and academic brilliance in eastern Uttar Pradesh.',
    legacyTitle: 'Our Divine Foundation & Spiritual Legacy',
    legacyP1: "Swami Adgadanand Public School was founded with the benevolent blessings of Param Pujya Swami Adgadanand Ji Maharaj (author of the acclaimed spiritual commentary 'Yatharth Geeta'). The institution embodies the timeless principle 'सा विद्या या विमुक्तये' (Knowledge is that which liberates), striving to provide holistic education that uplifts both the intellect and the soul.",
    legacyP2: 'Situated in Uttar Pradesh, the school caters to students from surrounding rural and suburban sectors, bridging modern academic curricula with foundational cultural values and ethical character.',
    visionTitle: 'Our Vision',
    visionText: 'To be a beacon of accessible, value-rooted modern education where every student develops sharp analytical intellect, sound moral judgment, and lifelong discipline.',
    missionTitle: 'Our Mission',
    missionText: 'To deliver rigorous education from classes 1st to 12th through qualified class mentors, accessible transport networks, transparent digital ERP systems, and individualized student care.',
  },
  facilities: [
    {
      id: 'fac_1',
      title: 'Well-Qualified Class Teachers',
      category: 'Academic Quality',
      badge: '100% Certified Faculty',
      description: 'Every section at S.A. Public School is mentored by a well-qualified, dedicated class teacher holding post-graduate (M.Sc / M.A.) and professional B.Ed qualifications from recognized state universities.',
      points: [
        'Personal student attention and daily doubt monitoring',
        'Comprehensive Board examination preparation for high scores',
        'Assigned class mentors tracking weekly attendance & progress',
      ],
      iconType: 'teacher',
    },
    {
      id: 'fac_2',
      title: 'School Van / Transport Facility Available',
      category: 'Transportation Service',
      badge: 'Safe & Verified Drivers',
      description: 'We provide convenient and secure school van and transport services covering all prominent sectors, towns, villages, and rural roads surrounding the school campus.',
      points: [
        'Fixed morning pickup and afternoon drop schedules',
        'Doorstep & designated pickup points for child safety',
        'Dedicated transport in-charge hotline (+91 9415754349)',
      ],
      iconType: 'van',
    },
    {
      id: 'fac_3',
      title: 'Science & Computer Lab Facilities',
      category: 'Practical Learning',
      badge: 'Modern Equipment',
      description: 'Well-equipped physics, chemistry, biology, and computer laboratories where students gain hands-on experimental learning and digital literacy.',
      points: [
        'Practical experiments under subject specialist supervision',
        'Computer workstation access for students of all grades',
        'Interactive audio-visual learning aids',
      ],
      iconType: 'lab',
    },
    {
      id: 'fac_4',
      title: 'Library & Reading Room',
      category: 'Knowledge Hub',
      badge: '2000+ Books & Periodicals',
      description: 'A serene reading environment stocked with NCERT textbooks, reference literature, moral philosophy, encyclopedia, and regional periodicals.',
      points: [
        'Curated spiritual and moral texts including Yatharth Geeta',
        'Academic competitive exam guides and reference materials',
        'Dedicated weekly library periods for all classes',
      ],
      iconType: 'library',
    },
  ],
  gallery: {
    moreMediaUrl: '',
    bannerTitle: 'View More Photos & Videos',
    bannerSubtitle: 'Follow our official channel for daily campus highlights, annual day celebrations, sports meet clips, and live event updates.',
    buttonText: 'Open Official Media Channel',
  },
};

interface SiteContentContextType {
  siteContent: SiteContent;
  loading: boolean;
  updateSiteContent: (updates: Partial<SiteContent>) => Promise<boolean>;
  refreshSiteContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  siteContent: defaultSiteContent,
  loading: false,
  updateSiteContent: async () => false,
  refreshSiteContent: async () => {},
});

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSiteContent((prev) => ({
            ...prev,
            ...data,
            school: { ...prev.school, ...(data.school || {}) },
            principal: { ...prev.principal, ...(data.principal || {}) },
            home: { ...prev.home, ...(data.home || {}) },
            about: { ...prev.about, ...(data.about || {}) },
            facilities: data.facilities || prev.facilities,
            gallery: { ...prev.gallery, ...(data.gallery || {}) },
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load site content from API', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateSiteContent = async (updates: Partial<SiteContent>): Promise<boolean> => {
    try {
      // Optimistic update
      setSiteContent((prev) => ({
        ...prev,
        ...updates,
        school: updates.school ? { ...prev.school, ...updates.school } : prev.school,
        principal: updates.principal ? { ...prev.principal, ...updates.principal } : prev.principal,
        home: updates.home ? { ...prev.home, ...updates.home } : prev.home,
        about: updates.about ? { ...prev.about, ...updates.about } : prev.about,
        facilities: updates.facilities || prev.facilities,
        gallery: updates.gallery ? { ...prev.gallery, ...updates.gallery } : prev.gallery,
      }));

      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const data = await res.json();
      if (data.siteContent) {
        setSiteContent(data.siteContent);
      }
      return true;
    } catch (err) {
      console.error('Failed to save site content updates', err);
      // Rollback or refetch
      fetchContent();
      return false;
    }
  };

  return (
    <SiteContentContext.Provider
      value={{
        siteContent,
        loading,
        updateSiteContent,
        refreshSiteContent: fetchContent,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
