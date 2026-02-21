import { Document, PurchasedDocument, AdminStat, SupportTicket } from "../../types";

export const CATEGORIES = ["Tous", "Mathématiques", "Sciences", "Français", "Anglais", "Physique", "Arabe", "Informatique"];
export const LEVELS = ["Tous", "Primaire", "Secondaire"];
export const GRADES_PRIMARY = ["1e année", "2e année", "3e année", "4e année", "5e année", "6e année"];
export const GRADES_SECONDARY = ["7e année", "8e année", "9e année", "1re année", "2e année", "3e année"];

export const ALL_DOCUMENTS: Document[] = [
  {
    title: "Pack Mathématiques Fondamentales",
    teacher: "Mme Amina",
    grade: "3e année",
    level: "Primaire",
    price: 12,
    rating: 4.8,
    tag: "Mathématiques",
    image: "/illustrations/learning-hub.svg",
  },
  {
    title: "Sciences à la maison",
    teacher: "M. Dev",
    grade: "6e année",
    level: "Primaire",
    price: 18,
    rating: 4.9,
    tag: "Sciences",
    image: "/illustrations/market-analytics.svg",
  },
  {
    title: "Sprint écriture créative",
    teacher: "Mme Leila",
    grade: "5e année",
    level: "Primaire",
    price: 10,
    rating: 4.7,
    tag: "Français",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Anglais pour débutants",
    teacher: "M. Ahmed",
    grade: "4e année",
    level: "Primaire",
    price: 15,
    rating: 4.6,
    tag: "Anglais",
    image: "/illustrations/family-learning.svg",
  },
  {
    title: "Physique - Révision rapide",
    teacher: "Mme Sana",
    grade: "2e année",
    level: "Secondaire",
    price: 22,
    rating: 4.5,
    tag: "Physique",
    image: "/illustrations/teacher-creator.svg",
  },
  {
    title: "Maths Collège - Bases solides",
    teacher: "M. Hamdi",
    grade: "7e année",
    level: "Secondaire",
    price: 14,
    rating: 4.4,
    tag: "Mathématiques",
    image: "/illustrations/family-learning.svg",
  },
];

export const PURCHASED_DOCS: PurchasedDocument[] = [
  { title: "Révision Trimestre 1", progress: 85, subject: "Maths" },
  { title: "Vocabulaire Essentiel", progress: 40, subject: "Français" },
];

export const ADMIN_STATS: AdminStat[] = [
  { label: "Enseignants actifs", value: "3,214", trend: "+4%" },
  { label: "Documents vérifiés", value: "12,908", trend: "+310" },
  { label: "Signalements", value: "38", trend: "-6" },
  { label: "Revenus gérés", value: "1,4M TND", trend: "+9%" },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    subject: "Demande de remboursement",
    owner: "Compte parent #541",
    priority: "Haute",
    priorityKey: "warning",
  },
  {
    subject: "Vérification paiement enseignant",
    owner: "Atelier: STEM Academy",
    priority: "Moyenne",
    priorityKey: "primary",
  },
  {
    subject: "Question politique contenu",
    owner: "École Groupe #12",
    priority: "Basse",
    priorityKey: "muted",
  },
];
