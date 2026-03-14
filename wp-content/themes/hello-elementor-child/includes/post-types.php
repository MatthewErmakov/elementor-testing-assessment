<?php
/**
 * Product post type registration and admin panel.
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
		'show_in_menu'        => false,
		'show_in_rest'        => true,
		'rest_base'           => 'products',
		'supports'            => array( 'title', 'editor', 'thumbnail' ),
		'has_archive'         => false,
		'exclude_from_search' => true,
	);

	register_post_type( 'product', $args );
}

add_action( 'init', __NAMESPACE__ . '\\register_product_post_type' );

/**
 * Register custom meta fields for Products.
 *
 * @since 1.0.2
 *
 * @return void
 */
function register_product_meta_fields(): void {
	$auth_callback = static function (): bool {
		return current_user_can( 'edit_posts' );
	};

	register_post_meta(
		'product',
		'product_price',
		array(
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'number',
			'default'           => 0,
			'auth_callback'     => $auth_callback,
			'sanitize_callback' => static function ( $value ) {
				return '' === $value ? 0 : floatval( $value );
			},
		)
	);

	register_post_meta(
		'product',
		'product_sale_price',
		array(
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'number',
			'default'           => 0,
			'auth_callback'     => $auth_callback,
			'sanitize_callback' => static function ( $value ) {
				return '' === $value ? 0 : floatval( $value );
			},
		)
	);

	register_post_meta(
		'product',
		'product_on_sale',
		array(
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'boolean',
			'default'           => false,
			'auth_callback'     => $auth_callback,
			'sanitize_callback' => 'rest_sanitize_boolean',
		)
	);

	register_post_meta(
		'product',
		'product_youtube',
		array(
			'show_in_rest'      => true,
			'single'            => true,
			'type'              => 'string',
			'default'           => '',
			'auth_callback'     => $auth_callback,
			'sanitize_callback' => 'esc_url_raw',
		)
	);
}

add_action( 'init', __NAMESPACE__ . '\\register_product_meta_fields' );

/**
 * Register REST fields for product meta to guarantee availability.
 *
 * @since 1.0.2
 *
 * @return void
 */
function register_product_rest_fields(): void {
	$fields = array(
		'product_price'       => array(
			'type'    => 'number',
			'default' => 0,
			'sanitize_callback' => static function ( $value ) {
				return '' === $value ? 0 : floatval( $value );
			},
		),
		'product_sale_price'  => array(
			'type'    => 'number',
			'default' => 0,
			'sanitize_callback' => static function ( $value ) {
				return '' === $value ? 0 : floatval( $value );
			},
		),
		'product_on_sale'     => array(
			'type'    => 'boolean',
			'default' => false,
			'sanitize_callback' => 'rest_sanitize_boolean',
		),
		'product_youtube'     => array(
			'type'    => 'string',
			'default' => '',
			'sanitize_callback' => 'esc_url_raw',
		),
	);

	foreach ( $fields as $field_name => $field_args ) {
		register_rest_field(
			'product',
			$field_name,
			array(
				'get_callback'    => static function ( $object ) use ( $field_name, $field_args ) {
					$post_id = is_array( $object ) ? (int) $object['id'] : (int) $object->ID;
					$value   = get_post_meta( $post_id, $field_name, true );

					if ( '' === $value || null === $value ) {
						$value = $field_args['default'];
					}

					if ( 'boolean' === $field_args['type'] ) {
						return (bool) $value;
					}

					if ( 'number' === $field_args['type'] ) {
						return (float) $value;
					}

					return (string) $value;
				},
				'update_callback' => static function ( $value, $object ) use ( $field_name, $field_args ) {
					$post_id = is_array( $object ) ? (int) $object['id'] : (int) $object->ID;

					if ( ! current_user_can( 'edit_post', $post_id ) ) {
						return new \WP_Error(
							'rest_forbidden',
							__( 'You are not allowed to edit this post.', 'hello-elementor-child' ),
							array( 'status' => rest_authorization_required_code() )
						);
					}

					$sanitize = $field_args['sanitize_callback'];
					$sanitized_value = is_callable( $sanitize ) ? call_user_func( $sanitize, $value ) : $value;

					if ( '' === $sanitized_value || null === $sanitized_value ) {
						$sanitized_value = $field_args['default'];
					}

					update_post_meta( $post_id, $field_name, $sanitized_value );

					return true;
				},
				'schema'          => array(
					'type'    => $field_args['type'],
					'default' => $field_args['default'],
				),
			)
		);
	}
}

add_action( 'rest_api_init', __NAMESPACE__ . '\\register_product_rest_fields' );

/**
 * Register the Products Manager admin page.
 *
 * @since 1.0.2
 *
 * @return void
 */
function register_products_admin_page(): void {
	add_menu_page(
		__( 'Products Manager', 'hello-elementor-child' ),
		__( 'Products Manager', 'hello-elementor-child' ),
		'edit_posts',
		'products-manager',
		__NAMESPACE__ . '\\render_products_admin_page',
		'dashicons-cart',
		30
	);
}

add_action( 'admin_menu', __NAMESPACE__ . '\\register_products_admin_page' );

/**
 * Render the admin app container.
 *
 * @since 1.0.2
 *
 * @return void
 */
function render_products_admin_page(): void {
	echo '<div class="wrap">';
	echo '<h1>' . esc_html__( 'Products Manager', 'hello-elementor-child' ) . '</h1>';
	echo '<div id="products-admin-app"></div>';
	echo '</div>';
}
