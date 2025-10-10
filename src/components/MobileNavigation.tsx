import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { Menu, X, BarChart3 } from "lucide-react";

interface MobileNavigationProps {}

export function MobileNavigation({}: MobileNavigationProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-80">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Converta</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => handleNavigation('/features')}
              >
                Features
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => handleNavigation('/partners')}
              >
                Partners
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left"
                onClick={() => handleNavigation('/pricing')}
              >
                Pricing
              </Button>

              <div className="border-t pt-4 mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleNavigation('/guest-analysis')}
                >
                  Free Analysis
                </Button>
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}