export interface ProjectGalleryItem {
  src: string;
  caption: string;
}

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  images: ProjectGalleryItem[];
}

export interface PursuitItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  description: string[];
  imageSrc?: string;
  imageAlt?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  period: string;
  highlights: string[];
  leadershipRole?: string;
  imageSrc?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  serviceType: string;
  message: string;
}
