/**
 * Reads product ID from the current URL query string.
 *
 * @since 1.0.2
 *
 * @returns Product ID or null when param is missing/invalid.
 */
export const getProductIdFromUrl = (): number | null => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("productId");
    const parsed = raw ? parseInt(raw, 10) : NaN;

    return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Updates browser URL with selected product ID for deep-linking.
 *
 * @since 1.0.2
 *
 * @param productId Product ID to set in URL or null to clear the param.
 * @returns void
 */
export const setProductIdInUrl = (productId: number | null): void => {
    const url = new URL(window.location.href);

    if (productId) {
        url.searchParams.set("productId", String(productId));
    } else {
        url.searchParams.delete("productId");
    }

    window.history.pushState(
        { productId: productId || null },
        "",
        url.toString(),
    );
};
