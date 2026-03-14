import React from "react";
import { Button } from "@wordpress/components";
import type { ProductsListItemProps } from "../types/interfaces";
import styles from "../styles/products-list.module.css";

/**
 * Renders one product row in list table.
 *
 * @since 1.0.2
 *
 * @param props Product list row props.
 * @returns Product row element.
 */
const ProductsListItem = ({
    product,
    title,
    thumbnailUrl,
    onEdit,
    onDelete,
}: ProductsListItemProps): React.JSX.Element => {
    return (
        <tr>
            <td>{title}</td>
            <td>
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="" className={styles.thumb} />
                ) : (
                    "-"
                )}
            </td>
            <td className={styles.actions}>
                <Button isSecondary onClick={() => onEdit(product)}>
                    Edit
                </Button>
                <Button isDestructive onClick={() => onDelete(product.id)}>
                    Delete
                </Button>
            </td>
        </tr>
    );
};

export default ProductsListItem;
