<?php
/**
 * Unit tests for product meta registration.
 */

declare(strict_types=1);

namespace MYHelloElementorChild;

use PHPUnit\Framework\TestCase;

final class ProductMetaRegistrationTest extends TestCase {
	protected function setUp(): void {
		reset_test_state();
	}

	public function test_product_rest_meta_fields_config_structure(): void {
		register_product_meta_fields();

		$meta = $GLOBALS[ TEST_STATE_KEY ]['post_meta'];

		$this->assertCount( 4, $meta );
		$this->assertArrayHasKey( 'product_price', $meta );
		$this->assertArrayHasKey( 'product_sale_price', $meta );
		$this->assertArrayHasKey( 'product_on_sale', $meta );
		$this->assertArrayHasKey( 'product_youtube', $meta );

		$this->assertSame( 'number', $meta['product_price']['args']['type'] );
		$this->assertSame( 0, $meta['product_price']['args']['default'] );
		$this->assertSame( 'boolean', $meta['product_on_sale']['args']['type'] );
		$this->assertSame( false, $meta['product_on_sale']['args']['default'] );
		$this->assertSame( 'string', $meta['product_youtube']['args']['type'] );
		$this->assertSame( '', $meta['product_youtube']['args']['default'] );
	}

	public function test_sanitize_product_number_meta_value(): void {
		register_product_meta_fields();

		$callback = $GLOBALS[ TEST_STATE_KEY ]['post_meta']['product_price']['args']['sanitize_callback'];

		$this->assertIsCallable( $callback );
		$this->assertSame( 0, $callback( '' ) );
		$this->assertSame( 29.99, $callback( '29.99' ) );
	}
}
