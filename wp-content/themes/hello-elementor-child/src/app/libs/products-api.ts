import apiFetch from "@wordpress/api-fetch";
import type { AppSettings, ApiProduct, CategoryTerm } from "../types/domain";
import type { SavePayload } from "../types/interfaces";

let configured = false;

/**
 * Reads localized app settings from global config.
 *
 * @since 1.0.2
 *
 * @returns Settings object for REST integration.
 */
export const getSettings = (): AppSettings => {
    return (
        window.HELLO_EL_CHILD || {
            restUrl: "",
            productsBase: "",
            categoriesBase: "",
            nonce: "",
        }
    );
};

/**
 * Registers apiFetch nonce middleware once per app lifecycle.
 *
 * @since 1.0.2
 *
 * @param settings Settings with REST nonce.
 * @returns void
 */
export const setupApi = (settings: AppSettings): void => {
    if (configured) {
        return;
    }

    if (settings.nonce && apiFetch.createNonceMiddleware) {
        apiFetch.use(apiFetch.createNonceMiddleware(settings.nonce));
    }

    configured = true;
};

/**
 * Fetches products collection used by list screen.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @returns Array of products.
 */
export const fetchProducts = async (
    settings: AppSettings,
): Promise<ApiProduct[]> => {
    const response = await apiFetch({
        url: `${settings.productsBase}?_embed&per_page=100`,
    });
    return (response || []) as ApiProduct[];
};

/**
 * Fetches single product in edit context.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @param id Product ID.
 * @returns Product entity.
 */
export const fetchProduct = async (
    settings: AppSettings,
    id: number,
): Promise<ApiProduct> => {
    const response = await apiFetch({
        url: `${settings.productsBase}/${id}?context=edit&_embed`,
    });
    return response as ApiProduct;
};

/**
 * Deletes product permanently via REST API.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @param id Product ID.
 * @returns Promise resolved when delete is completed.
 */
export const deleteProduct = async (
    settings: AppSettings,
    id: number,
): Promise<void> => {
    await apiFetch({
        method: "DELETE",
        url: `${settings.productsBase}/${id}`,
        data: { force: true },
    });
};

/**
 * Creates or updates product via REST API.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @param id Product ID (0 for create).
 * @param payload Product payload with meta and taxonomy fields.
 * @returns Saved product entity.
 */
export const saveProduct = async (
    settings: AppSettings,
    id: number,
    payload: SavePayload,
): Promise<ApiProduct> => {
    const response = await apiFetch({
        method: id ? "PUT" : "POST",
        url: id ? `${settings.productsBase}/${id}` : settings.productsBase,
        data: payload,
    });
    return response as ApiProduct;
};

/**
 * Fetches product categories for token suggestions and mapping.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @returns Array of category terms.
 */
export const fetchCategories = async (
    settings: AppSettings,
): Promise<CategoryTerm[]> => {
    const response = await apiFetch({
        url: `${settings.categoriesBase}?per_page=100`,
    });
    return (response || []) as CategoryTerm[];
};

/**
 * Resolves category IDs from token names, creating missing terms when needed.
 *
 * @since 1.0.2
 *
 * @param settings REST settings.
 * @param names User-entered category names.
 * @param categories Current loaded categories cache.
 * @returns Object with resolved IDs and refreshed categories cache.
 */
export const ensureCategoryIds = async (
    settings: AppSettings,
    names: string[],
    categories: CategoryTerm[],
): Promise<{ ids: number[]; categories: CategoryTerm[] }> => {
    const trimmed = names.map((name) => name.trim()).filter(Boolean);
    if (!trimmed.length) {
        return { ids: [], categories };
    }

    const existingByLower = new Map(
        categories.map((category) => [category.name.toLowerCase(), category]),
    );
    const nextCategories = [...categories];
    const ids: number[] = [];

    for (const name of trimmed) {
        const lower = name.toLowerCase();
        const existing = existingByLower.get(lower);
        if (existing) {
            ids.push(existing.id);
            continue;
        }

        const created = (await apiFetch({
            method: "POST",
            url: settings.categoriesBase,
            data: { name },
        })) as CategoryTerm;

        nextCategories.push(created);
        existingByLower.set(lower, created);
        ids.push(created.id);
    }

    return { ids, categories: nextCategories };
};
