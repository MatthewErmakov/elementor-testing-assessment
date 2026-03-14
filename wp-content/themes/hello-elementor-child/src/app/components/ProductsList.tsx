import React from "react";
import { Button } from "@wordpress/components";
import type { ProductsListProps } from "../types/interfaces";
import ProductsListItem from "./ProductsListItem";
import styles from "../styles/products-list.module.css";

/**
 * Renders products table with actions and create button.
 *
 * @since 1.0.2
 *
 * @param props Product list component props.
 * @returns Product list element.
 */
const ProductsList = ({
    products,
    onAddNew,
    onEdit,
    onDelete,
    getProductTitle,
    getProductThumbnail,
}: ProductsListProps): React.JSX.Element => {
    const rows = products.length
        ? products.map((product) => (
              <ProductsListItem
                  key={product.id}
                  product={product}
                  title={getProductTitle(product)}
                  thumbnailUrl={getProductThumbnail(product)}
                  onEdit={onEdit}
                  onDelete={onDelete}
              />
          ))
        : [
              <tr key="empty">
                  <td colSpan={3}>No products found.</td>
              </tr>,
          ];

    return (
        <div>
            <div className={styles.toolbar}>
                <Button isPrimary onClick={onAddNew}>
                    Add New
                </Button>
            </div>
            <table className={`widefat striped ${styles.table}`}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Thumbnail</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        </div>
    );
};

export default ProductsList;
