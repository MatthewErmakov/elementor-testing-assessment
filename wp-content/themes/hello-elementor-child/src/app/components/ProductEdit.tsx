import React, { useRef } from "react";
import {
    Button,
    FormTokenField,
    TextControl,
    ToggleControl,
} from "@wordpress/components";
import { RichText } from "@wordpress/block-editor";
import type { ProductEditProps } from "../types/interfaces";
import styles from "../styles/product-edit.module.css";

/**
 * Renders create/edit form for a product.
 *
 * @since 1.0.2
 *
 * @param props Product edit component props.
 * @returns Product editor element.
 */
const ProductEdit = ({
    product,
    categories,
    onBack,
    onSave,
    onFieldChange,
    onMetaChange,
    onError,
}: ProductEditProps): React.JSX.Element => {
    // stores wp.media frame instance between renders.
    const mediaFrameRef = useRef<WpMediaFrame | null>(null);

    /**
     * Opens media modal and updates featured image fields after selection.
     *
     * @since 1.0.2
     *
     * @returns void
     */
    const openMediaFrame = (): void => {
        if (!window.wp || !window.wp.media) {
            onError("Media library is unavailable.");
            return;
        }

        if (!mediaFrameRef.current) {
            mediaFrameRef.current = window.wp.media({
                title: "Select Image",
                button: { text: "Use this image" },
                library: { type: "image" },
                multiple: false,
            });

            mediaFrameRef.current.on("select", () => {
                const selection = mediaFrameRef.current
                    ?.state()
                    .get("selection")
                    .first();
                if (!selection) {
                    return;
                }

                const media = selection.toJSON();
                onFieldChange("featured_media", media.id);
                onFieldChange(
                    "imageUrl",
                    media.sizes?.thumbnail?.url || media.url || "",
                );
            });
        }

        mediaFrameRef.current.open();
    };

    return (
        <div>
            <div className={styles.toolbar}>
                <Button isSecondary onClick={onBack}>
                    Back to list
                </Button>
            </div>
            <div className={styles.grid}>
                <div className={styles.main}>
                    <TextControl
                        label="Title"
                        value={product.title}
                        onChange={(value) => onFieldChange("title", value)}
                    />
                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <RichText
                            tagName="div"
                            className={styles.description}
                            value={product.content}
                            onChange={(value: string) =>
                                onFieldChange("content", value)
                            }
                            placeholder="Description"
                            inlineToolbar
                            allowedFormats={[
                                "core/bold",
                                "core/italic",
                                "core/link",
                                "core/strikethrough",
                            ]}
                        />
                    </div>
                    <TextControl
                        label="Price"
                        value={String(product.meta.product_price)}
                        onChange={(value) =>
                            onMetaChange("product_price", value)
                        }
                    />
                    <TextControl
                        label="Sale price"
                        value={String(product.meta.product_sale_price)}
                        onChange={(value) =>
                            onMetaChange("product_sale_price", value)
                        }
                    />
                    <ToggleControl
                        label="Is on sale?"
                        checked={!!product.meta.product_on_sale}
                        onChange={(value) =>
                            onMetaChange("product_on_sale", value)
                        }
                    />
                    <TextControl
                        label="YouTube video"
                        value={product.meta.product_youtube}
                        onChange={(value) =>
                            onMetaChange("product_youtube", value)
                        }
                    />
                    <FormTokenField
                        label="Categories"
                        value={product.categoryNames}
                        suggestions={categories.map(
                            (category) => category.name,
                        )}
                        onChange={(tokens) => {
                            const normalizedTokens = tokens
                                .map((token) =>
                                    typeof token === "string"
                                        ? token
                                        : token.value,
                                )
                                .filter(Boolean);
                            const selectedIds = Array.from(
                                new Set(
                                    normalizedTokens
                                        .map((name) => {
                                            const matchedCategory =
                                                categories.find(
                                                    (category) =>
                                                        category.name.toLowerCase() ===
                                                        name.toLowerCase(),
                                                );
                                            return matchedCategory?.id;
                                        })
                                        .filter(
                                            (id): id is number =>
                                                typeof id === "number",
                                        ),
                                ),
                            );

                            onFieldChange("categoryNames", normalizedTokens);
                            onFieldChange("categoryIds", selectedIds);
                        }}
                    />
                </div>
                <div>
                    <div className={styles.field}>
                        <label className={styles.label}>Thumbnail</label>
                        <div className={styles.media}>
                            <Button isSecondary onClick={openMediaFrame}>
                                Select Image
                            </Button>
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt=""
                                    className={styles.thumb}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.toolbar}>
                <Button isPrimary onClick={onSave}>
                    Save Product
                </Button>
            </div>
        </div>
    );
};

export default ProductEdit;
