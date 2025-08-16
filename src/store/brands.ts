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

export const useBrandStore = create<BrandsState>((set, get) => ({
  brands: [],
  activeBrand: null,

  setActiveBrand: (id: string) => {
    const b = get().brands.find(x => x.id === id) || null;
    set({ activeBrand: b });
  },

  initFromDb: async () => {
    const rows = await getBrands();
    const list: Brand[] = rows.map((r: any) => ({
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

  createBrand: async (b) => {
    try {
      const created = await createOrUpdateBrand({
        name: b.name,
        voice: b.toneOfVoice,
        tone: b.toneOfVoice,
        style: { colors: b.brandColors, keywords: b.keywords, industry: b.industry, audience: b.targetAudience },
        assets: { website: b.website, logo: b.logoUrl, social: b.socialHandles }
      });

      const newBrand: Brand = {
        ...b,
        id: created.id,
        createdAt: new Date(created.created_at),
        updatedAt: new Date(created.updated_at ?? created.created_at)
      };

      set(state => ({ brands: [...state.brands, newBrand], activeBrand: newBrand }));
    } catch (e: any) {
      toast({ title: "Brand save failed", description: e.message ?? "Unknown error", variant: "destructive" });
      throw e;
    }
  },

  refreshFromDb: async () => {
    const rows = await getBrands();
    const list: Brand[] = rows.map((r: any) => ({
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