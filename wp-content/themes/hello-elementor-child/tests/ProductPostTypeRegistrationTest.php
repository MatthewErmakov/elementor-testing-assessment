<?php
/**
 * Unit tests for product post type registration.
 */

declare(strict_types=1);

namespace MYHelloElementorChild;

use PHPUnit\Framework\TestCase;

final class ProductPostTypeRegistrationTest extends TestCase {
	protected function setUp(): void {
		reset_test_state();
	}

	public function test_product_post_type_uses_rest_configuration(): void {
		register_product_post_type();

		$this->assertArrayHasKey( 'product', $GLOBALS[ TEST_STATE_KEY ]['post_types'] );

		$args = $GLOBALS[ TEST_STATE_KEY ]['post_types']['product'];

		$this->assertTrue( $args['show_in_rest'] );
		$this->assertSame( 'products', $args['rest_base'] );
	}
}
