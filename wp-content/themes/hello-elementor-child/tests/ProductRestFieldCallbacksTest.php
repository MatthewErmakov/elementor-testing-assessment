<?php
/**
 * Unit tests for product REST field callbacks.
 */

declare(strict_types=1);

namespace MYHelloElementorChild;

use PHPUnit\Framework\TestCase;

final class ProductRestFieldCallbacksTest extends TestCase {
	protected function setUp(): void {
		reset_test_state();
	}

	public function test_get_product_rest_meta_field_value_defaults(): void {
		register_product_rest_fields();

		$price_get_cb   = $this->get_rest_field( 'product_price' )['get_callback'];
		$sale_get_cb    = $this->get_rest_field( 'product_sale_price' )['get_callback'];
		$on_sale_get_cb = $this->get_rest_field( 'product_on_sale' )['get_callback'];
		$youtube_get_cb = $this->get_rest_field( 'product_youtube' )['get_callback'];

		$this->assertSame( 0.0, $price_get_cb( array( 'id' => 50 ) ) );
		$this->assertSame( 0.0, $sale_get_cb( (object) array( 'ID' => 50 ) ) );
		$this->assertFalse( $on_sale_get_cb( (object) array( 'ID' => 50 ) ) );
		$this->assertSame( '', $youtube_get_cb( array( 'id' => 50 ) ) );
	}

	public function test_get_product_rest_meta_field_value_typed(): void {
		register_product_rest_fields();

		$GLOBALS[ TEST_STATE_KEY ]['meta_values'][55] = array(
			'product_price'      => '19.95',
			'product_sale_price' => '8.5',
			'product_on_sale'    => '1',
			'product_youtube'    => 'https://example.com/watch?v=abc',
		);

		$price      = $this->get_rest_field( 'product_price' )['get_callback']( array( 'id' => 55 ) );
		$sale_price = $this->get_rest_field( 'product_sale_price' )['get_callback']( array( 'id' => 55 ) );
		$on_sale    = $this->get_rest_field( 'product_on_sale' )['get_callback']( array( 'id' => 55 ) );
		$youtube    = $this->get_rest_field( 'product_youtube' )['get_callback']( array( 'id' => 55 ) );

		$this->assertIsFloat( $price );
		$this->assertIsFloat( $sale_price );
		$this->assertIsBool( $on_sale );
		$this->assertIsString( $youtube );

		$this->assertSame( 19.95, $price );
		$this->assertSame( 8.5, $sale_price );
		$this->assertTrue( $on_sale );
		$this->assertSame( 'https://example.com/watch?v=abc', $youtube );
	}

	public function test_update_product_rest_meta_field_value_forbidden_without_permission(): void {
		register_product_rest_fields();
		$GLOBALS[ TEST_STATE_KEY ]['can_edit'] = false;

		$update_cb = $this->get_rest_field( 'product_price' )['update_callback'];
		$result    = $update_cb( '12.5', (object) array( 'ID' => 77 ) );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( 401, $result->get_error_data()['status'] );
	}

	public function test_update_product_rest_meta_field_value_updates_meta(): void {
		register_product_rest_fields();
		$GLOBALS[ TEST_STATE_KEY ]['can_edit'] = true;

		$object = (object) array( 'ID' => 99 );

		$price_update_cb      = $this->get_rest_field( 'product_price' )['update_callback'];
		$sale_price_update_cb = $this->get_rest_field( 'product_sale_price' )['update_callback'];
		$on_sale_update_cb    = $this->get_rest_field( 'product_on_sale' )['update_callback'];
		$youtube_update_cb    = $this->get_rest_field( 'product_youtube' )['update_callback'];

		$this->assertTrue( $price_update_cb( '41.42', $object ) );
		$this->assertTrue( $sale_price_update_cb( '', $object ) );
		$this->assertTrue( $on_sale_update_cb( '0', $object ) );
		$this->assertTrue( $youtube_update_cb( 'javascript:alert(1)', $object ) );

		$this->assertSame( 41.42, $GLOBALS[ TEST_STATE_KEY ]['updated_meta'][99]['product_price'] );
		$this->assertSame( 0, $GLOBALS[ TEST_STATE_KEY ]['updated_meta'][99]['product_sale_price'] );
		$this->assertFalse( $GLOBALS[ TEST_STATE_KEY ]['updated_meta'][99]['product_on_sale'] );
		$this->assertSame( '', $GLOBALS[ TEST_STATE_KEY ]['updated_meta'][99]['product_youtube'] );
	}

	private function get_rest_field( string $field_name ): array {
		$fields = $GLOBALS[ TEST_STATE_KEY ]['rest_fields']['product'] ?? array();

		$this->assertArrayHasKey( $field_name, $fields );

		return $fields[ $field_name ];
	}
}
