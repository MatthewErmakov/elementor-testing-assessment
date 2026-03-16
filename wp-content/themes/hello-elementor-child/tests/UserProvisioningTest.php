<?php
/**
 * Unit tests for user provisioning and admin-bar visibility.
 */

declare(strict_types=1);

namespace MYHelloElementorChild;

use PHPUnit\Framework\TestCase;

final class UserProvisioningTest extends TestCase {
	protected function setUp(): void {
		reset_test_state();
	}

	public function test_ensure_wp_test_user_does_not_insert_when_username_already_exists(): void {
		$GLOBALS[ TEST_STATE_KEY ]['username_exists_return'] = true;

		ensure_wp_test_user();

		$this->assertSame( array( 'wp-test' ), $GLOBALS[ TEST_STATE_KEY ]['username_exists_calls'] );
		$this->assertCount( 0, $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'] );
	}

	public function test_ensure_wp_test_user_inserts_expected_payload(): void {
		ensure_wp_test_user();

		$this->assertCount( 1, $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'] );

		$payload = $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'][0];

		$this->assertSame( 'wp-test', $payload['user_login'] );
		$this->assertSame( 'editor', $payload['role'] );
		$this->assertSame( 'wptest@elementor.com', $payload['user_email'] );
	}

	public function test_ensure_wp_test_user_handles_wp_error_from_insert(): void {
		$GLOBALS[ TEST_STATE_KEY ]['has_insert_user_result'] = true;
		$GLOBALS[ TEST_STATE_KEY ]['insert_user_result'] = new \WP_Error( 'insert_failed', 'Failed to insert user' );

		ensure_wp_test_user();

		$this->assertCount( 1, $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'] );
		$this->assertSame( 'wp-test', $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'][0]['user_login'] );
	}

	public function test_lifecycle_user_creation_functions_delegate_to_ensure_wp_test_user(): void {
		on_theme_switch_create_users();

		$this->assertSame( array( 'wp-test' ), $GLOBALS[ TEST_STATE_KEY ]['username_exists_calls'] );
		$this->assertCount( 1, $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'] );

		reset_test_state();

		maybe_create_users_on_init();

		$this->assertSame( array( 'wp-test' ), $GLOBALS[ TEST_STATE_KEY ]['username_exists_calls'] );
		$this->assertCount( 1, $GLOBALS[ TEST_STATE_KEY ]['insert_user_calls'] );
	}

	public function test_maybe_hide_admin_bar_for_wp_test_and_other_users(): void {
		$GLOBALS[ TEST_STATE_KEY ]['current_user'] = new \WP_User( 'wp-test' );
		$this->assertFalse( maybe_hide_admin_bar_for_wp_test( true ) );
		$this->assertFalse( maybe_hide_admin_bar_for_wp_test( false ) );

		$GLOBALS[ TEST_STATE_KEY ]['current_user'] = new \WP_User( 'editor-user' );
		$this->assertTrue( maybe_hide_admin_bar_for_wp_test( true ) );
		$this->assertFalse( maybe_hide_admin_bar_for_wp_test( false ) );
	}
}
