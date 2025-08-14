import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BrandState, Brand } from '@/types';

// Mock brands for demo
const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'TechFlow Solutions',
    description: 'Innovative software solutions for modern businesses',
    industry: 'Technology',
    targetAudience: 'B2B Software Companies',
    toneOfVoice: 'Professional, innovative, trustworthy',
    keywords: ['software', 'innovation', 'enterprise', 'solutions'],
    brandColors: ['#3B82F6', '#1E40AF', '#F3F4F6'],
    website: 'https://techflow.example.com',
    socialHandles: {
      twitter: '@techflow',
      linkedin: 'techflow-solutions',
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'brand-2',
    name: 'EcoLife Wellness',
    description: 'Sustainable wellness products for conscious consumers',
    industry: 'Health & Wellness',
    targetAudience: 'Health-conscious millennials',
    toneOfVoice: 'Warm, authentic, inspiring',
    keywords: ['wellness', 'sustainable', 'natural', 'healthy'],
    brandColors: ['#10B981', '#059669', '#ECFDF5'],
    website: 'https://ecolife.example.com',
    socialHandles: {
      instagram: '@ecolifewellness',
      facebook: 'ecolifewellness',
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      brands: mockBrands,
      activeBrand: mockBrands[0],
      isLoading: false,

      addBrand: (brandData) => {
        const newBrand: Brand = {
          ...brandData,
          id: `brand-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          brands: [...state.brands, newBrand],
          activeBrand: newBrand,
        }));
      },

      updateBrand: (id, updates) => {
        set(state => ({
          brands: state.brands.map(brand =>
            brand.id === id 
              ? { ...brand, ...updates, updatedAt: new Date() }
              : brand
          ),
          activeBrand: state.activeBrand?.id === id 
            ? { ...state.activeBrand, ...updates, updatedAt: new Date() }
            : state.activeBrand,
        }));
      },

      setActiveBrand: (brandId) => {
        const { brands } = get();
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
          set({ activeBrand: brand });
        }
      },

      deleteBrand: (id) => {
        set(state => ({
          brands: state.brands.filter(brand => brand.id !== id),
          activeBrand: state.activeBrand?.id === id ? null : state.activeBrand,
        }));
      },
    }),
    {
      name: 'flux-brands',
      version: 1,
    }
  )
);