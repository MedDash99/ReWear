"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// Card related imports are no longer needed directly here if ContentCard handles all card UI
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import Header from '../../components/ui/fullHeader';       // Your Header component
import LoginCard from '../../components/ui/loginCard';
import ContentCard from '../../components/ui/contentCard'; // <<< IMPORT THE NEW ContentCard COMPONENT
import { createClient } from "@/utils/supabase/client";
import { getPageRange } from "@/utils/pagination";
import { useTranslation } from "@/i18n/useTranslation";
import { getAllCategoryIds, getCategoryTranslationKey, type CategoryId } from '@/lib/categories';

// This Item type definition should be consistent with the one in ContentCard.tsx
// and what your /api/products endpoint returns.
// Consider moving this to a shared types file (e.g., src/types/index.ts)
type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: CategoryId;
  sellerId: number | string;
  seller: {
    name: string | null;
    avatarUrl: string | null;
  };
};

const PAGE_SIZE = 10;

export default function StoreLandingPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const categoryIds = getAllCategoryIds();
  const categoryData = categoryIds.map(id => ({
    id,
    translationKey: getCategoryTranslationKey(id),
    label: t(getCategoryTranslationKey(id) as any)
  }));

  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [languageCheckDone, setLanguageCheckDone] = useState(false);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const isAuthenticated = !!session?.user;

  // Check user's saved language preference and redirect if needed
  useEffect(() => {
    const checkUserLanguagePreference = async () => {
      if (status === 'authenticated' && session?.user && !languageCheckDone) {
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            const savedLanguage = data.language || 'english';
            const preferredLocale = savedLanguage === 'french' ? 'fr' : 'en';
            
            if (preferredLocale !== locale) {
              // User's saved preference is different from current locale
              const currentPath = window.location.pathname.replace(`/${locale}`, '');
              router.push(`/${preferredLocale}${currentPath}${window.location.search}`);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking language preference:', error);
        }
        setLanguageCheckDone(true);
      } else if (status === 'unauthenticated') {
        setLanguageCheckDone(true);
      }
    };

    checkUserLanguagePreference();
  }, [status, session, locale, router, languageCheckDone]);

  // useRouter is now used within ContentCard for navigation
  // const router = useRouter();

  const filteredItems = items.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const categoryMatch = selectedCategory ? item.category === selectedCategory : true;
    return searchMatch && categoryMatch;
  });

  const fetchItems = useCallback(async () => {
    // Don't fetch items until language check is complete to avoid unnecessary requests
    if (!languageCheckDone) return;
    
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { from, to } = getPageRange(currentPage, PAGE_SIZE);
      const { data, count, error } = await supabase
        .from('items')
        .select(
          `
        id,
        name,
        description,
        price,
        image_url,
        category,
        seller_id,
        users:seller_id (
          name,
          profile_image_url
        )
      `,
          { count: 'exact' }
        )
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.image_url,
        category: item.category,
        sellerId: item.seller_id,
        seller: {
          name: item.users?.name || 'Unknown',
          avatarUrl: item.users?.profile_image_url || null,
        },
      }));

      setItems(mapped);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, languageCheckDone]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCategoryClick = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Show loading if we're still checking language preference
  if (!languageCheckDone) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header
          onSignInClick={() => {
            setLoginMode("login");
            setIsLoginOpen(true);
          }}
          onSignUpClick={() => {
            setLoginMode("signup");
            setIsLoginOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // handleItemCardClick is now handled within ContentCard.tsx

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        onSignInClick={() => {
          setLoginMode("login");
          setIsLoginOpen(true);
        }}
        onSignUpClick={() => {
          setLoginMode("signup");
          setIsLoginOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="text-sm px-4 py-2.5 min-w-[80px]"
          >
            {t('all')}
          </Button>
          {categoryData.map((category) => (
            <Button
              variant={selectedCategory === category.id ? "default" : "outline"}
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="text-sm px-4 py-2.5 min-w-[80px]"
            >
              {category.label}
            </Button>
          ))}
        </div>

        {isLoading && <div className="text-center py-10"><p>{t('loadingItems')}</p></div>}
        {error && <div className="text-center py-10 text-red-500"><p>{t('error')}: {error}</p></div>}

        {/* Items Grid - Optimized for larger cards on desktop */}
        {!isLoading && !error && filteredItems.length > 0 ? (
          <div className="
          grid
          grid-cols-1
          xs:grid-cols-2
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-4
          2xl:grid-cols-5
          gap-4
          sm:gap-6
          lg:gap-8
          justify-items-center
          max-w-none
          ">
            {filteredItems.map(item => (
              <ContentCard 
                key={item.id} 
                item={item} 
                isAuthenticated={isAuthenticated}
                onLoginRequired={() => setIsLoginOpen(true)}
              />
            ))}
          </div>
        ) : (
          !isLoading && !error && <div className="text-center py-10 text-gray-500">
            <p>{t('noItemsFound')}</p>
          </div>
        )}
        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              {t('prev')}
            </Button>
            <span className="text-sm">
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              {t('next')}
            </Button>
          </div>
        )}
      </main>

      {isLoginOpen && <LoginCard onClose={() => setIsLoginOpen(false)} initialMode={loginMode} />}
    </div>
  );
} 