<?php
/**
 * Product post type registration.
 *
 * @since 1.0.0
 */

namespace MYHelloElementorChild;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Products custom post type.
 *
 * @since 1.0.0
 *
 * @return void
 */
function register_product_post_type(): void {
	$labels = array(
		'name'          => __( 'Products', 'hello-elementor-child' ),
		'singular_name' => __( 'Product', 'hello-elementor-child' ),
	);

	$args = array(
		'labels'              => $labels,
		'public'              => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,
		'rest_base'           => 'products',
		'supports'            => array( 'title', 'editor', 'thumbnail' ),
		'has_archive'         => false,
		'exclude_from_search' => true,
	);

	register_post_type( 'product', $args );
}

add_action( 'init', __NAMESPACE__ . '\\register_product_post_type' );
