import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Notice, Spinner } from "@wordpress/components";
import "@wordpress/format-library";
import ProductsList from "./app/components/ProductsList";
import ProductEdit from "./app/components/ProductEdit";
import {
    deleteProduct,
    ensureCategoryIds,
    fetchCategories,
    fetchProduct,
    fetchProducts,
    getSettings,
    saveProduct,
    setupApi,
} from "./app/libs/products-api";
import { getProductIdFromUrl, setProductIdInUrl } from "./app/libs/history";
import {
    createEmptyProduct,
    extractCategoryTerms,
    getProductThumbnail,
    getProductTitle,
    normalizeProduct,
} from "./app/libs/productMappers";
import type {
    ApiProduct,
    CategoryTerm,
    EditorProduct,
    NoticeState,
} from "./app/types/domain";
import styles from "./admin.module.css";

/**
 * Renders the products manager admin application and coordinates list/edit flows.
 *
 * @since 1.0.2
 *
 * @returns Admin application root element.
 */
const AdminApp = (): React.JSX.Element => {
    // memoizes immutable app settings read from localized window config.
    const settings = useMemo(() => getSettings(), []);

    // stores local UI state for screen mode, resources, and notices.
    const [view, setView] = useState<"list" | "edit">("list");
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [categories, setCategories] = useState<CategoryTerm[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentProduct, setCurrentProduct] = useState<EditorProduct | null>(
        null,
    );
    const [notice, setNotice] = useState<NoticeState | null>(null);

    // memoizes a stable notice setter for async operations.
    /**
     * Sets the current notice message and status shown in the admin UI.
     *
     * @since 1.0.2
     *
     * @param status Notice severity level.
     * @param message Notice text to display.
     * @returns void
     */
    const setNoticeMessage = useCallback(
        (status: NoticeState["status"], message: string): void => {
            setNotice({ status, message });
        },
        [],
    );

    // memoizes products loading handler used by init/save/delete flows.
    /**
     * Fetches all products for the list screen and updates loading state.
     *
     * @since 1.0.2
     *
     * @returns Promise resolved after products are loaded.
     */
    const loadProducts = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            setProducts(await fetchProducts(settings));
        } catch (error) {
            setNoticeMessage(
                "error",
                error instanceof Error
                    ? error.message
                    : "Failed to load products.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [setNoticeMessage, settings]);

    // memoizes categories loading handler used by init and editor flows.
    /**
     * Fetches all category terms available for product assignment.
     *
     * @since 1.0.2
     *
     * @returns Promise resolved after categories are loaded.
     */
    const loadCategories = useCallback(async (): Promise<void> => {
        try {
            setCategories(await fetchCategories(settings));
        } catch (error) {
            setNoticeMessage(
                "error",
                error instanceof Error
                    ? error.message
                    : "Failed to load categories.",
            );
        }
    }, [setNoticeMessage, settings]);

    // memoizes category merge helper for product edit hydration.
    /**
     * Merges embedded category terms from a product response into the local terms cache.
     *
     * @since 1.0.2
     *
     * @param product Product response that may contain embedded terms.
     * @returns void
     */
    const mergeEmbeddedCategories = useCallback((product: ApiProduct): void => {
        const embeddedTerms = extractCategoryTerms(product);
        if (!embeddedTerms.length) {
            return;
        }

        setCategories((prev) => {
            const map = new Map(prev.map((term) => [term.id, term]));
            embeddedTerms.forEach((term) => {
                if (!map.has(term.id)) {
                    map.set(term.id, term);
                }
            });
            return Array.from(map.values());
        });
    }, []);

    // memoizes deep-link aware product opener for edit mode.
    /**
     * Opens a product in edit mode by ID and optionally syncs URL history.
     *
     * @since 1.0.2
     *
     * @param productId Product ID to open.
     * @param syncHistory Whether to update URL with the selected product ID.
     * @returns Promise resolved after edit state is prepared.
     */
    const openProductById = useCallback(
        async (productId: number, syncHistory = true): Promise<void> => {
            if (!productId) {
                return;
            }

            setIsLoading(true);
            try {
                const product = await fetchProduct(settings, productId);
                mergeEmbeddedCategories(product);
                setCurrentProduct(normalizeProduct(product));
                setView("edit");
                if (syncHistory) {
                    setProductIdInUrl(productId);
                }
            } catch (error) {
                setNoticeMessage(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Failed to load product.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [mergeEmbeddedCategories, setNoticeMessage, settings],
    );

    // memoizes list navigation handler for toolbar and history actions.
    /**
     * Switches UI back to the products list and optionally updates URL history.
     *
     * @since 1.0.2
     *
     * @param syncHistory Whether to remove product ID from the URL.
     * @returns void
     */
    const goToList = useCallback((syncHistory = true): void => {
        setView("list");
        setCurrentProduct(null);
        if (syncHistory) {
            setProductIdInUrl(null);
        }
    }, []);

    // memoizes new-product initializer for the create flow.
    /**
     * Creates an empty product model and opens the edit screen in create mode.
     *
     * @since 1.0.2
     *
     * @returns void
     */
    const startNew = useCallback((): void => {
        setCurrentProduct(createEmptyProduct());
        setView("edit");
        setProductIdInUrl(null);
    }, []);

    // memoizes list row edit handler to open existing products.
    /**
     * Opens edit mode for a product selected in the list screen.
     *
     * @since 1.0.2
     *
     * @param product Product selected from the list.
     * @returns void
     */
    const startEdit = useCallback(
        (product: ApiProduct): void => {
            if (!product?.id) {
                return;
            }
            void openProductById(product.id);
        },
        [openProductById],
    );

    // memoizes generic product field updater for editor bindings.
    /**
     * Updates one top-level field in the editable product model.
     *
     * @since 1.0.2
     *
     * @template T Product field key.
     * @param field Field name to update.
     * @param value New field value.
     * @returns void
     */
    const updateField = useCallback(
        <T extends keyof EditorProduct>(
            field: T,
            value: EditorProduct[T],
        ): void => {
            setCurrentProduct((prev) => {
                const next = { ...(prev || createEmptyProduct()) };
                next[field] = value;
                return next;
            });
        },
        [],
    );

    // memoizes product meta updater for editor controls.
    /**
     * Updates one meta field in the editable product model.
     *
     * @since 1.0.2
     *
     * @param field Meta field key to update.
     * @param value New meta value.
     * @returns void
     */
    const updateMeta = useCallback(
        <T extends keyof EditorProduct["meta"]>(
            field: T,
            value: EditorProduct["meta"][T],
        ): void => {
            setCurrentProduct((prev) => {
                const next = { ...(prev || createEmptyProduct()) };
                next.meta = { ...next.meta, [field]: value };
                return next;
            });
        },
        [],
    );

    // memoizes save handler used by editor primary action.
    /**
     * Validates, normalizes, and saves the current product via REST API.
     *
     * @since 1.0.2
     *
     * @returns Promise resolved after save flow completes.
     */
    const saveCurrent = useCallback(async (): Promise<void> => {
        if (!currentProduct) {
            return;
        }

        setIsLoading(true);

        const price = Number.parseFloat(
            String(currentProduct.meta.product_price),
        );
        const salePrice = Number.parseFloat(
            String(currentProduct.meta.product_sale_price),
        );
        const normalizedPrice = Number.isNaN(price) ? 0 : price;
        const normalizedSalePrice = Number.isNaN(salePrice) ? 0 : salePrice;

        if (normalizedPrice > 0 && normalizedSalePrice >= normalizedPrice) {
            setNoticeMessage(
                "error",
                "Sale price must be lower than regular price.",
            );
            setIsLoading(false);
            return;
        }

        try {
            const ensured = await ensureCategoryIds(
                settings,
                currentProduct.categoryNames || [],
                categories,
            );
            setCategories(ensured.categories);

            await saveProduct(settings, currentProduct.id, {
                title: currentProduct.title,
                content: currentProduct.content,
                status: "publish",
                featured_media: currentProduct.featured_media || 0,
                product_price: normalizedPrice,
                product_sale_price: normalizedSalePrice,
                product_on_sale: !!currentProduct.meta.product_on_sale,
                product_youtube: currentProduct.meta.product_youtube,
                meta: {
                    product_price: normalizedPrice,
                    product_sale_price: normalizedSalePrice,
                    product_on_sale: !!currentProduct.meta.product_on_sale,
                    product_youtube: currentProduct.meta.product_youtube,
                },
                "product-categories": ensured.ids,
            });

            setNoticeMessage("success", "Product saved.");
            goToList();
            await loadProducts();
        } catch (error) {
            setNoticeMessage(
                "error",
                error instanceof Error
                    ? error.message
                    : "Failed to save product.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [
        categories,
        currentProduct,
        goToList,
        loadProducts,
        setNoticeMessage,
        settings,
    ]);

    // memoizes delete handler used by list row destructive action.
    /**
     * Deletes a product after confirmation and refreshes the list view.
     *
     * @since 1.0.2
     *
     * @param id Product ID to delete.
     * @returns Promise resolved after delete flow completes.
     */
    const removeProduct = useCallback(
        async (id: number): Promise<void> => {
            if (!id) {
                return;
            }

            if (!window.confirm("Delete this product?")) {
                return;
            }

            setIsLoading(true);
            try {
                await deleteProduct(settings, id);
                setNoticeMessage("success", "Product deleted.");
                await loadProducts();
            } catch (error) {
                setNoticeMessage(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Failed to delete product.",
                );
            } finally {
                setIsLoading(false);
            }
        },
        [loadProducts, setNoticeMessage, settings],
    );

    // initializes wp.apiFetch nonce middleware once settings are available.
    useEffect(() => {
        setupApi(settings);
    }, [settings]);

    // performs initial loading for products and categories on mount.
    useEffect(() => {
        void loadProducts();
        void loadCategories();
    }, [loadCategories, loadProducts]);

    // syncs edit/list view with URL deep-link and browser history navigation.
    useEffect(() => {
        const initialId = getProductIdFromUrl();
        if (initialId) {
            void openProductById(initialId, false);
        }

        /**
         * Handles browser back/forward navigation to keep UI state aligned with URL.
         *
         * @since 1.0.2
         *
         * @returns void
         */
        const onPopstate = (): void => {
            const id = getProductIdFromUrl();
            if (id) {
                void openProductById(id, false);
                return;
            }
            goToList(false);
        };

        window.addEventListener("popstate", onPopstate);
        return () => window.removeEventListener("popstate", onPopstate);
    }, [goToList, openProductById]);

    // maps selected category IDs to token names when categories cache changes.
    useEffect(() => {
        if (
            !currentProduct ||
            !currentProduct.categoryIds.length ||
            !categories.length ||
            currentProduct.categoryNames.length
        ) {
            return;
        }

        const names = currentProduct.categoryIds
            .map((id) => categories.find((category) => category.id === id))
            .filter(Boolean)
            .map((category) => category!.name);

        if (!names.length) {
            return;
        }

        if (
            names.join("|") !== (currentProduct.categoryNames || []).join("|")
        ) {
            updateField("categoryNames", names);
        }
    }, [categories, currentProduct, updateField]);

    return (
        <div className={styles.root}>
            {notice ? (
                <Notice
                    status={notice.status}
                    onRemove={() => setNotice(null)}
                    isDismissible
                >
                    {notice.message}
                </Notice>
            ) : null}
            {isLoading ? (
                <div className={styles.loading}>
                    <Spinner />
                </div>
            ) : null}
            {view === "list" ? (
                <ProductsList
                    products={products}
                    onAddNew={startNew}
                    onEdit={startEdit}
                    onDelete={(id) => void removeProduct(id)}
                    getProductTitle={getProductTitle}
                    getProductThumbnail={getProductThumbnail}
                />
            ) : null}
            {view === "edit" && currentProduct ? (
                <ProductEdit
                    product={currentProduct}
                    categories={categories}
                    onBack={() => goToList()}
                    onSave={() => void saveCurrent()}
                    onFieldChange={updateField}
                    onMetaChange={updateMeta}
                    onError={(message) => setNoticeMessage("error", message)}
                />
            ) : null}
        </div>
    );
};

const mountNode = document.getElementById("products-admin-app");
if (mountNode) {
    createRoot(mountNode).render(<AdminApp />);
}
