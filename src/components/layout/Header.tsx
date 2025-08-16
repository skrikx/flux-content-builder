import { useState } from 'react';
import { ChevronDown, Plus, Sparkles, User, LogOut } from 'lucide-react';
import { useSessionStore } from '@/store/session';
import { useBrandStore } from '@/store/brands';
import { GenerateModal } from '@/components/GenerateModal';
import { BrandModal } from '@/components/BrandModal';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const user = useSessionStore(state => state.user);
  const logout = useSessionStore(state => state.logout);
  const { brands, activeBrand, setActiveBrand } = useBrandStore();

  const handleOneClick = () => {
    setIsGenerateOpen(true);
    // TODO: Implement One-Click generation
  };

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          
          {/* Brand Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 min-w-[200px] justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded flux-gradient-bg" />
                  <span className="truncate">{activeBrand?.name || (brands.length === 0 ? 'Create a Brand' : 'Select Brand')}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {brands.length === 0 ? (
                <DropdownMenuItem disabled>
                  <div className="text-muted-foreground text-sm">No brands created yet</div>
                </DropdownMenuItem>
              ) : (
                brands.map((brand) => (
                  <DropdownMenuItem
                    key={brand.id}
                    onClick={() => setActiveBrand(brand.id)}
                    className={activeBrand?.id === brand.id ? 'bg-accent' : ''}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded flux-gradient-bg" />
                      {brand.name}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowBrandModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* One-Click Generate Button */}
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button className="flux-gradient-bg text-white hover:opacity-90 flux-transition">
                <Sparkles className="w-4 h-4 mr-2" />
                One-Click Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>One-Click Content Generation</DialogTitle>
                <DialogDescription>
                  Generate AI-powered content for your brand in seconds.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This feature will automatically generate content ideas, captions, and posts based on your brand settings and current trends.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <GenerateModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal} 
      />
      <BrandModal 
        open={showBrandModal} 
        onOpenChange={setShowBrandModal} 
      />
    </header>
  );
}