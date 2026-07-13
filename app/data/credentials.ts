export type CredentialCategory = "certificate" | "study" | "research";

export type CredentialItem = {
  category: CredentialCategory;
  label: string;
  title: string;
  description: string;
};

export const credentials: CredentialItem[] = [
  {
    category: "certificate",
    label: "자격증",
    title: "",
    description: "",
  },
  {
    category: "study",
    label: "유학",
    title: "",
    description: "",
  },
  {
    category: "research",
    label: "논문",
    title: "",
    description: "",
  },
];
