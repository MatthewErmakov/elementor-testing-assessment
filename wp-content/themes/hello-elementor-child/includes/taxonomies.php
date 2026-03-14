<?php
/**
 * Product taxonomies registration.
 *
 * @since 1.0.0
 */

namespace MYHelloElementorChild;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Categories taxonomy for Products.
 *
 * @since 1.0.0
 *
 * @return void
 */
function register_product_categories_taxonomy(): void {
	$labels = array(
		'name'          => __( 'Categories', 'hello-elementor-child' ),
		'singular_name' => __( 'Category', 'hello-elementor-child' ),
	);

	$args = array(
		'labels'            => $labels,
		'public'            => true,
		'show_ui'           => true,
		'show_in_rest'      => true,
		'rest_base'         => 'product-categories',
		'hierarchical'      => true,
		'show_admin_column' => true,
	);

	register_taxonomy( 'product_category', array( 'product' ), $args );
}

add_action( 'init', __NAMESPACE__ . '\\register_product_categories_taxonomy' );