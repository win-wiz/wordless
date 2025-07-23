export interface FAQItem {
  question: string;
  answer:
    | string
    | {
        intro?: string;
        list?: string[];
        outro?: string;
      };
  category: 'general' | 'usage' | 'technical' | 'sharing' | 'privacy';
}

export type CategoryType = 'all' | 'general' | 'usage' | 'technical' | 'sharing' | 'privacy';

export interface CategoryButtonProps {
  category: CategoryType;
  isActive: boolean;
  count: number;
  onClick: (category: CategoryType) => void;
}

export interface FAQItemComponentProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface CategoryFilterProps {
  activeCategory: CategoryType;
  categoryCounts: Record<string, number>;
  onCategoryChange: (category: CategoryType) => void;
}

export interface FAQListProps {
  filteredFAQ: FAQItem[];
  openItems: Set<number>;
  toggleItem: (index: number) => void;
  isLoaded: boolean;
}

export interface NoResultsProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export interface EmptyStateProps {
  onViewAll: () => void;
}