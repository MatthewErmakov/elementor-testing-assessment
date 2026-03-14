import type {
    ApiProduct,
    CategoryTerm,
    EditorProduct,
    ProductMeta,
} from "../types/domain";

/**
 * Resolves product title from REST payload.
 *
 * @since 1.0.2
 *
 * @param product Product REST entity.
 * @returns Resolved title string.
 */
export const getProductTitle = (product: ApiProduct): string => {
    if (!product.title) {
        return "";
    }

    if (typeof product.title === "string") {
        return product.title;
    }

    return product.title.raw || product.title.rendered || "";
};

/**
 * Resolves best thumbnail URL from embedded media payload.
 *
 * @since 1.0.2
 *
 * @param product Product REST entity.
 * @returns Thumbnail URL or empty string.
 */
export const getProductThumbnail = (product: ApiProduct): string => {
    const media = product._embedded?.["wp:featuredmedia"]?.[0];
    if (!media) {
        return "";
    }

    if (media.media_details?.sizes?.thumbnail?.source_url) {
        return media.media_details.sizes.thumbnail.source_url;
    }

    return media.source_url || "";
};

/**
 * Extracts taxonomy terms for product categories from embedded relations.
 *
 * @since 1.0.2
 *
 * @param product Product REST entity.
 * @returns Array of product category terms.
 */
export const extractCategoryTerms = (product: ApiProduct): CategoryTerm[] => {
    const terms: CategoryTerm[] = [];
    const embedded = product._embedded?.["wp:term"] || [];

    embedded.forEach((group) => {
        if (!Array.isArray(group)) {
            return;
        }

        group.forEach((term) => {
            if (term && term.taxonomy === "product_category") {
                terms.push(term);
            }
        });
    });

    return terms;
};

/**
 * Normalizes numeric meta values while preserving empty state for form inputs.
 *
 * @since 1.0.2
 *
 * @param value Raw numeric field value.
 * @returns Normalized number or empty string.
 */
export const normalizeNumberField = (value: unknown): number | string => {
    if (value === 0 || value === "0") {
        return value as number | string;
    }

    return (value as string) || "";
};

/**
 * Creates initial empty editor model for product create flow.
 *
 * @since 1.0.2
 *
 * @returns Empty product editor model.
 */
export const createEmptyProduct = (): EditorProduct => ({
    id: 0,
    title: "",
    content: "",
    featured_media: 0,
    imageUrl: "",
    categoryIds: [],
    categoryNames: [],
    meta: {
        product_price: "",
        product_sale_price: "",
        product_on_sale: false,
        product_youtube: "",
    },
});

/**
 * Maps REST product entity to editor model used by UI controls.
 *
 * @since 1.0.2
 *
 * @param product Product REST entity.
 * @returns Normalized editor model.
 */
export const normalizeProduct = (product: ApiProduct): EditorProduct => {
    const meta: Partial<ProductMeta> = product.meta
        ? product.meta
        : {
              product_price: product.product_price,
              product_sale_price: product.product_sale_price,
              product_on_sale: product.product_on_sale,
              product_youtube: product.product_youtube,
          };

    const embeddedTerms = extractCategoryTerms(product);
    let categoryIds = embeddedTerms.map((term) => term.id);
    const categoryNames = embeddedTerms.map((term) => term.name);

    const restCategories =
        product["product-categories"] || product.product_category;
    if (restCategories) {
        if (Array.isArray(restCategories) && restCategories.length) {
            categoryIds = categoryIds.length ? categoryIds : restCategories;
        } else if (typeof restCategories === "number") {
            categoryIds = categoryIds.length ? categoryIds : [restCategories];
        }
    }

    return {
        id: product.id || 0,
        title: getProductTitle(product),
        content: product.content?.raw || product.content?.rendered || "",
        featured_media: product.featured_media || 0,
        imageUrl: getProductThumbnail(product),
        categoryIds,
        categoryNames,
        meta: {
            product_price: normalizeNumberField(meta.product_price),
            product_sale_price: normalizeNumberField(meta.product_sale_price),
            product_on_sale: !!meta.product_on_sale,
            product_youtube: meta.product_youtube || "",
        },
    };
};
