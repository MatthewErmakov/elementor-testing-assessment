<?php
/**
 * PHPUnit bootstrap for theme unit tests.
 */

declare(strict_types=1);

namespace {
	if ( ! class_exists( 'WP_Error' ) ) {
		class WP_Error {
			private string $code;
			private string $message;
			private array $data;

			public function __construct( string $code = '', string $message = '', array $data = array() ) {
				$this->code    = $code;
				$this->message = $message;
				$this->data    = $data;
			}

			public function get_error_code(): string {
				return $this->code;
			}

			public function get_error_message(): string {
				return $this->message;
			}

			public function get_error_data(): array {
				return $this->data;
			}
		}
	}

	if ( ! class_exists( 'WP_User' ) ) {
		class WP_User {
			public string $user_login;

			public function __construct( string $user_login = '' ) {
				$this->user_login = $user_login;
			}
		}
	}

	if ( ! function_exists( 'rest_sanitize_boolean' ) ) {
		function rest_sanitize_boolean( $value ): bool {
			if ( is_bool( $value ) ) {
				return $value;
			}

			if ( is_numeric( $value ) ) {
				return (bool) (int) $value;
			}

			return in_array( strtolower( (string) $value ), array( '1', 'true', 'yes', 'on' ), true );
		}
	}

	if ( ! function_exists( 'esc_url_raw' ) ) {
		function esc_url_raw( $value ): string {
			$url = filter_var( (string) $value, FILTER_SANITIZE_URL );

			if ( ! is_string( $url ) || '' === $url ) {
				return '';
			}

			$is_valid = filter_var( $url, FILTER_VALIDATE_URL );

			if ( ! $is_valid ) {
				return '';
			}

			$scheme = parse_url( $url, PHP_URL_SCHEME );

			return in_array( strtolower( (string) $scheme ), array( 'http', 'https' ), true ) ? $url : '';
		}
	}
}

namespace MYHelloElementorChild {
	const TEST_STATE_KEY = 'hello_elementor_child_product_rest_test_state';

	function __($text): string {
		return (string) $text;
	}

	function add_action( string $hook, $callback ): void {
		$GLOBALS[ TEST_STATE_KEY ]['actions'][] = array(
			'hook'     => $hook,
			'callback' => $callback,
		);
	}

	function add_filter( string $hook, $callback ): void {
		$GLOBALS[ TEST_STATE_KEY ]['filters'][] = array(
			'hook'     => $hook,
			'callback' => $callback,
		);
	}

	function add_menu_page( ...$args ): void {
		$GLOBALS[ TEST_STATE_KEY ]['menu_pages'][] = $args;
	}

	function register_post_type( string $post_type, array $args ): void {
		$GLOBALS[ TEST_STATE_KEY ]['post_types'][ $post_type ] = $args;
	}

	function register_taxonomy( string $taxonomy, array $object_type, array $args ): void {
		$GLOBALS[ TEST_STATE_KEY ]['taxonomies'][ $taxonomy ] = array(
			'object_type' => $object_type,
			'args'        => $args,
		);
	}

	function register_post_meta( string $post_type, string $meta_key, array $args ): void {
		$GLOBALS[ TEST_STATE_KEY ]['post_meta'][ $meta_key ] = array(
			'post_type' => $post_type,
			'args'      => $args,
		);
	}

	function register_rest_field( string $object_type, string $field_name, array $args ): void {
		$GLOBALS[ TEST_STATE_KEY ]['rest_fields'][ $object_type ][ $field_name ] = $args;
	}

	function current_user_can( string $capability, ...$args ): bool {
		return (bool) ( $GLOBALS[ TEST_STATE_KEY ]['can_edit'] ?? false );
	}

	function rest_authorization_required_code(): int {
		return (int) ( $GLOBALS[ TEST_STATE_KEY ]['authorization_code'] ?? 401 );
	}

	function get_post_meta( int $post_id, string $meta_key, bool $single = true ) {
		if ( isset( $GLOBALS[ TEST_STATE_KEY ]['meta_values'][ $post_id ][ $meta_key ] ) ) {
			return $GLOBALS[ TEST_STATE_KEY ]['meta_values'][ $post_id ][ $meta_key ];
		}

		return '';
	}

	function update_post_meta( int $post_id, string $meta_key, $meta_value ): bool {
		$GLOBALS[ TEST_STATE_KEY ]['updated_meta'][ $post_id ][ $meta_key ] = $meta_value;

		return true;
	}

	function username_exists( string $username ): bool {
		$GLOBALS[ TEST_STATE_KEY ]['username_exists_calls'][] = $username;

		return (bool) ( $GLOBALS[ TEST_STATE_KEY ]['username_exists_return'] ?? false );
	}

	function wp_insert_user( array $userdata ) {
		$GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'][] = $userdata;

		if ( true === ( $GLOBALS[ TEST_STATE_KEY ]['has_insert_user_result'] ?? false ) ) {
			return $GLOBALS[ TEST_STATE_KEY ]['insert_user_result'];
		}

		return (int) ( $GLOBALS[ TEST_STATE_KEY ]['insert_user_id'] ?? 123 );
	}

	function is_wp_error( $thing ): bool {
		return $thing instanceof \WP_Error;
	}

	function wp_get_current_user() {
		return $GLOBALS[ TEST_STATE_KEY ]['current_user'] ?? null;
	}

	function reset_test_state(): void {
		$GLOBALS[ TEST_STATE_KEY ] = array(
			'actions'            => array(),
			'filters'            => array(),
			'menu_pages'         => array(),
			'post_types'         => array(),
			'taxonomies'         => array(),
			'post_meta'          => array(),
			'rest_fields'        => array(),
			'meta_values'        => array(),
			'updated_meta'       => array(),
			'can_edit'           => true,
			'authorization_code' => 401,
			'username_exists_calls' => array(),
			'username_exists_return' => false,
			'insert_user_calls'  => array(),
			'insert_user_id'     => 123,
			'has_insert_user_result' => false,
			'insert_user_result' => null,
			'current_user'       => null,
		);
	}

	if ( ! defined( 'ABSPATH' ) ) {
		define( 'ABSPATH', dirname( __DIR__, 4 ) . '/' );
	}

	require_once dirname( __DIR__ ) . '/includes/post-types.php';
	require_once dirname( __DIR__ ) . '/includes/taxonomies.php';
	require_once dirname( __DIR__ ) . '/includes/users.php';

	reset_test_state();
}
