<?php
/**
 * Admin scripts and styles for Products Manager.
 *
 * @since 1.0.2
 */

namespace MYHelloElementorChild;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue assets for the Products Manager admin page.
 *
 * @since 1.0.2
 *
 * @param string $hook_suffix Current admin page hook suffix.
 * @return void
 */
function enqueue_products_manager_assets( string $hook_suffix ): void {
	if ( 'toplevel_page_products-manager' !== $hook_suffix ) {
		return;
	}

	$stylesheet_dir = get_stylesheet_directory();
	$stylesheet_url = get_stylesheet_directory_uri();

	$script_path = $stylesheet_dir . '/assets/admin.js';
	$style_path  = $stylesheet_dir . '/assets/admin.css';
	$script_url  = $stylesheet_url . '/assets/admin.js';
	$style_url   = $stylesheet_url . '/assets/admin.css';
	$script_ver  = file_exists( $script_path ) ? (string) filemtime( $script_path ) : '1.0.2';
	$style_ver   = file_exists( $style_path ) ? (string) filemtime( $style_path ) : '1.0.2';

	wp_enqueue_media();
	wp_enqueue_style( 'wp-components' );
	wp_enqueue_style( 'wp-block-editor' );

	wp_enqueue_script(
		'hello-elementor-child-products-admin',
		$script_url,
		array(),
		$script_ver,
		true
	);

	wp_enqueue_style(
		'hello-elementor-child-products-admin',
		$style_url,
		array(),
		$style_ver
	);

	wp_add_inline_script(
		'hello-elementor-child-products-admin',
		'window.HELLO_EL_CHILD = ' . wp_json_encode(
			array(
				'restUrl'        => esc_url_raw( rest_url() ),
				'productsBase'   => esc_url_raw( rest_url( 'wp/v2/products' ) ),
				'categoriesBase' => esc_url_raw( rest_url( 'wp/v2/product-categories' ) ),
				'nonce'          => wp_create_nonce( 'wp_rest' ),
			)
		) . ';',
		'before'
	);
}

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\enqueue_products_manager_assets' );
