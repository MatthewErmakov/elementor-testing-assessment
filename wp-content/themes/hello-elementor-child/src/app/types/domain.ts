export interface AppSettings {
    restUrl: string;
    productsBase: string;
    categoriesBase: string;
    nonce: string;
}

export interface ProductMeta {
    product_price: number | string;
    product_sale_price: number | string;
    product_on_sale: boolean;
    product_youtube: string;
}

export interface CategoryTerm {
    id: number;
    name: string;
    taxonomy?: string;
}

export interface ApiFeaturedMedia {
    source_url?: string;
    media_details?: {
        sizes?: {
            thumbnail?: {
                source_url: string;
            };
        };
    };
}

export interface ApiProduct {
    id: number;
    title?: { raw?: string; rendered?: string } | string;
    content?: { raw?: string; rendered?: string };
    featured_media?: number;
    meta?: Partial<ProductMeta>;
    product_price?: number;
    product_sale_price?: number;
    product_on_sale?: boolean;
    product_youtube?: string;
    product_category?: number[] | number;
    "product-categories"?: number[] | number;
    _embedded?: {
        "wp:featuredmedia"?: ApiFeaturedMedia[];
        "wp:term"?: Array<Array<CategoryTerm>>;
    };
}

export interface EditorProduct {
    id: number;
    title: string;
    content: string;
    featured_media: number;
    imageUrl: string;
    categoryIds: number[];
    categoryNames: string[];
    meta: ProductMeta;
}

export interface NoticeState {
    status: "success" | "error" | "warning" | "info";
    message: string;
}
