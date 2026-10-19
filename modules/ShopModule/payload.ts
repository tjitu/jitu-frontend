import { TokenPackage } from "./interface";

export const tokenPackages: TokenPackage[] = [
  {
    id: 1,
    tokenAmount: 1,
    title: "1 coin",
    subtitle: "Skor IRT + pembahasan 1 tryout",
    originalPrice: 15000,
    discount: 0,
    finalPrice: 15000,
    savings: 0,
    pricePerToken: "15.000",
    categoryBg: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    tokenAmount: 3,
    title: "3 coin",
    subtitle: "Skor IRT + pembahasan 3 tryout",
    originalPrice: 45000,
    discount: 13,
    finalPrice: 39000,
    savings: 6000,
    pricePerToken: "13.000",
    categoryBg: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    tokenAmount: 5,
    title: "5 coin",
    subtitle: "Skor IRT + pembahasan 5 tryout",
    originalPrice: 75000,
    discount: 21,
    finalPrice: 59000,
    savings: 16000,
    pricePerToken: "11.800",
    categoryBg: "from-purple-500 to-purple-600",
  },
  {
    id: 4,
    tokenAmount: 10,
    title: "10 coin",
    subtitle: "Harga per tryout paling hemat",
    originalPrice: 150000,
    discount: 41,
    finalPrice: 89000,
    savings: 61000,
    pricePerToken: "8.900",
    categoryBg: "from-emerald-500 to-emerald-600",
    popular: false,
    badge: "Paling hemat",
  },
];

export const contactInfos = [
  {
    name: "Hakim Ninja Mie",
    contacts: {
      LINE: "@hakimnm",
      Email: "hakimnm@email.net",
      WhatsApp: "0812-3456-7890",
    },
  },
];
