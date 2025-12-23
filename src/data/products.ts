export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
  containsShrimp?: boolean;
  servings?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export const categories: Category[] = [
  { id: 'destaques', name: 'Destaques', icon: '⭐' },
  { id: 'combinados', name: 'Combinados', icon: '🍱' },
  { id: 'sashimis', name: 'Sashimis', icon: '🐟' },
  { id: 'temakis', name: 'Temakis', icon: '🌯' },
  { id: 'uramakis', name: 'Uramakis', icon: '🍣' },
  { id: 'hossomakis', name: 'Hossomakis', icon: '🥢' },
  { id: 'niguiris', name: 'Niguiris', icon: '🍙' },
  { id: 'gunkans', name: 'Gunkans', icon: '🍘' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
];

export const products: Product[] = [
  // Destaques / Combinados
  {
    id: 'combo-salmao-52',
    name: 'Combo Salmão (52 peças)',
    description: '12 sashimi salmão; 8 hossomaki filadélfia; 10 uramaki salmão palha doce; 10 uramaki filadélfia; 6 niguiri filadélfia; 6 gunkan filadélfia. (NÃO É POSSÍVEL FAZER TROCAS)',
    price: 224.00,
    image: 'combo-salmao',
    category: 'combinados',
    badge: 'Mais pedido',
    servings: 2,
  },
  {
    id: 'combo-exclusivo-42',
    name: 'Combo Exclusivo (42 peças)',
    description: '12 sashimis; 10 uramaki palha doce; 10 uramaki shake ebi; 6 niguiris variados; 4 gunkan filadélfia. (CONTÉM CAMARÃO) (NÃO É POSSÍVEL FAZER TROCAS)',
    price: 189.90,
    image: 'combo-exclusivo',
    category: 'combinados',
    badge: 'Sugestão da casa',
    containsShrimp: true,
    servings: 2,
  },
  {
    id: 'combo-tradicional-30',
    name: 'Combo Tradicional (30 peças)',
    description: '8 sashimi salmão; 8 hossomaki filadélfia; 8 uramaki salmão; 6 niguiri variados. Perfeito para uma pessoa.',
    price: 149.90,
    image: 'combo-salmao',
    category: 'combinados',
    servings: 1,
  },
  {
    id: 'combo-casal-60',
    name: 'Combo Casal (60 peças)',
    description: '15 sashimis variados; 15 uramakis variados; 10 hossomakis; 10 niguiris; 10 gunkans. Ideal para compartilhar.',
    price: 289.90,
    image: 'combo-exclusivo',
    category: 'combinados',
    servings: 2,
  },
  // Sashimis
  {
    id: 'sashimi-salmao-10',
    name: 'Sashimi Salmão (10 unid)',
    description: '10 fatias generosas de salmão fresco, cortadas na hora.',
    price: 59.90,
    image: 'sashimi',
    category: 'sashimis',
  },
  {
    id: 'sashimi-salmao-5',
    name: 'Sashimi Salmão (5 unid)',
    description: '5 fatias de salmão fresco premium.',
    price: 32.90,
    image: 'sashimi',
    category: 'sashimis',
  },
  {
    id: 'sashimi-atum',
    name: 'Sashimi Atum (5 unid)',
    description: '5 fatias de atum fresco, sabor intenso e marcante.',
    price: 45.90,
    image: 'sashimi',
    category: 'sashimis',
  },
  // Temakis
  {
    id: 'temaki-salmao',
    name: 'Temaki Salmão',
    description: 'Cone de nori recheado com arroz, salmão fresco e cream cheese.',
    price: 29.90,
    image: 'temaki',
    category: 'temakis',
  },
  {
    id: 'temaki-skin',
    name: 'Temaki Skin',
    description: 'Temaki com pele de salmão crocante, arroz e cream cheese.',
    price: 27.90,
    image: 'temaki',
    category: 'temakis',
  },
  {
    id: 'temaki-camarao',
    name: 'Temaki Camarão',
    description: 'Temaki recheado com camarão empanado, arroz e molho especial.',
    price: 34.90,
    image: 'temaki',
    category: 'temakis',
    containsShrimp: true,
  },
  {
    id: 'temaki-philadelphia',
    name: 'Temaki Philadelphia',
    description: 'Temaki de salmão com cream cheese e cebolinha.',
    price: 28.90,
    image: 'temaki',
    category: 'temakis',
  },
  // Uramakis
  {
    id: 'uramaki-philadelphia-8',
    name: 'Uramaki Philadelphia (8 unid)',
    description: 'Uramaki de salmão com cream cheese, envolto em arroz.',
    price: 42.90,
    image: 'uramaki',
    category: 'uramakis',
  },
  {
    id: 'uramaki-salmao-palha-8',
    name: 'Uramaki Salmão Palha Doce (8 unid)',
    description: 'Uramaki de salmão com cream cheese, coberto com palha de batata doce.',
    price: 44.90,
    image: 'uramaki',
    category: 'uramakis',
  },
  {
    id: 'uramaki-shake-ebi-8',
    name: 'Uramaki Shake Ebi (8 unid)',
    description: 'Uramaki com salmão e camarão empanado, finalizado com molho especial.',
    price: 48.90,
    image: 'uramaki',
    category: 'uramakis',
    containsShrimp: true,
  },
  {
    id: 'uramaki-skin-8',
    name: 'Uramaki Skin (8 unid)',
    description: 'Uramaki com pele de salmão crocante e cream cheese.',
    price: 39.90,
    image: 'uramaki',
    category: 'uramakis',
  },
  // Hossomakis
  {
    id: 'hossomaki-salmao-8',
    name: 'Hossomaki Salmão (8 unid)',
    description: 'Rolinho fino de nori com arroz e salmão.',
    price: 28.90,
    image: 'hossomaki',
    category: 'hossomakis',
  },
  {
    id: 'hossomaki-philadelphia-8',
    name: 'Hossomaki Philadelphia (8 unid)',
    description: 'Hossomaki de salmão com cream cheese.',
    price: 32.90,
    image: 'hossomaki',
    category: 'hossomakis',
  },
  {
    id: 'hossomaki-kappa-8',
    name: 'Hossomaki Kappa (8 unid)',
    description: 'Hossomaki de pepino japonês, opção leve e refrescante.',
    price: 22.90,
    image: 'hossomaki',
    category: 'hossomakis',
  },
  // Niguiris
  {
    id: 'niguiri-salmao-4',
    name: 'Niguiri Salmão (4 unid)',
    description: 'Bolinho de arroz coberto com fatia de salmão fresco.',
    price: 24.90,
    image: 'combo-salmao',
    category: 'niguiris',
  },
  {
    id: 'niguiri-atum-4',
    name: 'Niguiri Atum (4 unid)',
    description: 'Niguiri tradicional de atum.',
    price: 28.90,
    image: 'combo-salmao',
    category: 'niguiris',
  },
  // Gunkans
  {
    id: 'gunkan-philadelphia-4',
    name: 'Gunkan Philadelphia (4 unid)',
    description: 'Gunkan com salmão e cream cheese.',
    price: 26.90,
    image: 'gunkan',
    category: 'gunkans',
  },
  {
    id: 'gunkan-salmao-crispy-4',
    name: 'Gunkan Salmão Crispy (4 unid)',
    description: 'Gunkan de salmão com crispy crocante.',
    price: 28.90,
    image: 'gunkan',
    category: 'gunkans',
  },
  // Bebidas
  {
    id: 'coca-cola-lata',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante Coca-Cola gelado.',
    price: 7.90,
    image: 'combo-salmao',
    category: 'bebidas',
  },
  {
    id: 'guarana-lata',
    name: 'Guaraná Antarctica Lata 350ml',
    description: 'Refrigerante Guaraná Antarctica gelado.',
    price: 6.90,
    image: 'combo-salmao',
    category: 'bebidas',
  },
  {
    id: 'agua-mineral',
    name: 'Água Mineral 500ml',
    description: 'Água mineral sem gás.',
    price: 4.90,
    image: 'combo-salmao',
    category: 'bebidas',
  },
  {
    id: 'suco-laranja',
    name: 'Suco de Laranja 300ml',
    description: 'Suco de laranja natural.',
    price: 12.90,
    image: 'combo-salmao',
    category: 'bebidas',
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === 'destaques') {
    return products.filter(p => p.badge);
  }
  return products.filter(p => p.category === categoryId);
};

export const getProductImage = (imageName: string): string => {
  const images: Record<string, string> = {
    'combo-salmao': '/src/assets/combo-salmao.jpg',
    'combo-exclusivo': '/src/assets/combo-exclusivo.jpg',
    'temaki': '/src/assets/temaki.jpg',
    'sashimi': '/src/assets/sashimi.jpg',
    'uramaki': '/src/assets/uramaki.jpg',
    'hossomaki': '/src/assets/hossomaki.jpg',
    'gunkan': '/src/assets/gunkan.jpg',
  };
  return images[imageName] || images['combo-salmao'];
};
