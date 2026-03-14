import type { ApiProduct, CategoryTerm, EditorProduct } from "./domain";

export interface ProductEditProps {
    product: EditorProduct;
    categories: CategoryTerm[];
    onBack: () => void;
    onSave: () => void;
    onFieldChange: <T extends keyof EditorProduct>(
        field: T,
        value: EditorProduct[T],
    ) => void;
    onMetaChange: <T extends keyof EditorProduct["meta"]>(
        field: T,
        value: EditorProduct["meta"][T],
    ) => void;
    onError: (message: string) => void;
}

export interface ProductsListItemProps {
    product: ApiProduct;
    title: string;
    thumbnailUrl: string;
    onEdit: (product: ApiProduct) => void;
    onDelete: (productId: number) => void;
}

export interface ProductsListProps {
    products: ApiProduct[];
    onAddNew: () => void;
    onEdit: (product: ApiProduct) => void;
    onDelete: (productId: number) => void;
    getProductTitle: (product: ApiProduct) => string;
    getProductThumbnail: (product: ApiProduct) => string;
}

export interface SavePayload {
    title: string;
    content: string;
    status: "publish";
    featured_media: number;
    product_price: number;
    product_sale_price: number;
    product_on_sale: boolean;
    product_youtube: string;
    meta: {
        product_price: number;
        product_sale_price: number;
        product_on_sale: boolean;
        product_youtube: string;
    };
    "product-categories": number[];
}
