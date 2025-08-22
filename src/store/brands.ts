import { create } from 'zustand';
import { Brand } from '@/types';
import { createOrUpdateBrand, getBrands } from '@/lib/brands';
import { toast } from '@/hooks/use-toast';

type BrandsState = {
  brands: Brand[];
  activeBrand: Brand | null;
  createBrand: (b: Omit<Brand, 'id'|'createdAt'|'updatedAt'>) => Promise<void>;
  setActiveBrand: (id: string) => void;
  initFromDb: () => Promise<void>;
  refreshFromDb: () => Promise<void>;
};

interface DatabaseBrandRow {
  id: string;
  name: string;
  voice?: string;
  tone?: string;
  created_at: string;
  updated_at?: string;
  style?: {
    industry?: string;
    audience?: string;
    keywords?: string[];
    colors?: string[];
  };
  assets?: {
    website?: string;
    logo?: string;
    social?: Record<string, string>;
  };
}

export const useBrandStore = create<BrandsState>((set, get) => ({
  brands: [],
  activeBrand: null,

  setActiveBrand: (id: string) => {
    const b = get().brands.find(x => x.id === id) || null;
    set({ activeBrand: b });
  },

  initFromDb: async () => {
    try {
      console.log('[BrandStore] Initializing from DB...');
      const rows = await getBrands();
      console.log('[BrandStore] Got brands:', rows?.length || 0);
      
      const list: Brand[] = (rows || []).map((r: DatabaseBrandRow) => ({
        id: r.id,
        name: r.name,
        description: r.voice ?? '',
        industry: r.style?.industry ?? 'General',
        targetAudience: r.style?.audience ?? '',
        toneOfVoice: r.tone ?? '',
        keywords: r.style?.keywords ?? [],
        brandColors: r.style?.colors ?? [],
        website: r.assets?.website,
        logoUrl: r.assets?.logo,
        socialHandles: r.assets?.social ?? {},
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at ?? r.created_at),
      }));
      
      set({ brands: list, activeBrand: list[0] ?? null });
      console.log('[BrandStore] Set brands:', list.length, 'active:', list[0]?.name);
    } catch (e) {
      console.error('[BrandStore] initFromDb failed:', e);
      // Don't rethrow to prevent app crash
    }
  },

  createBrand: async (b) => {
    try {
      console.log('[BrandStore] Creating brand:', b.name);
      const created = await createOrUpdateBrand({
        name: b.name,
        voice: b.toneOfVoice,
        tone: b.toneOfVoice,
        style: { colors: b.brandColors, keywords: b.keywords, industry: b.industry, audience: b.targetAudience },
        assets: { website: b.website, logo: b.logoUrl, social: b.socialHandles }
      });

      console.log('[BrandStore] Brand created:', created.id);
      const newBrand: Brand = {
        ...b,
        id: created.id,
        createdAt: new Date(created.created_at),
        updatedAt: new Date(created.updated_at ?? created.created_at)
      };

      set(state => ({ brands: [...state.brands, newBrand], activeBrand: newBrand }));
      console.log('[BrandStore] Brand added to store');
      
      toast({ title: "Brand created", description: `${b.name} has been created successfully.` });
    } catch (e: unknown) {
      console.error('[BrandStore] Create brand failed:', e);
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Brand save failed", description: errorMessage, variant: "destructive" });
      throw e;
    }
  },

  refreshFromDb: async () => {
    const rows = await getBrands();
    const list: Brand[] = rows.map((r: DatabaseBrandRow) => ({
      id: r.id,
      name: r.name,
      description: r.voice ?? '',
      industry: r.style?.industry ?? 'General',
      targetAudience: r.style?.audience ?? '',
      toneOfVoice: r.tone ?? '',
      keywords: r.style?.keywords ?? [],
      brandColors: r.style?.colors ?? [],
      website: r.assets?.website,
      logoUrl: r.assets?.logo,
      socialHandles: r.assets?.social ?? {},
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at ?? r.created_at),
    }));
    set({ brands: list, activeBrand: list[0] ?? null });
  },
}));