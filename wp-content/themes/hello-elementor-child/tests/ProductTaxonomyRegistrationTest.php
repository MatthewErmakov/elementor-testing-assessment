<?php
/**
 * Unit tests for product taxonomy registration.
 */

declare(strict_types=1);

namespace MYHelloElementorChild;

use PHPUnit\Framework\TestCase;

final class ProductTaxonomyRegistrationTest extends TestCase {
	protected function setUp(): void {
		reset_test_state();
	}

	public function test_register_taxonomy_is_called_for_product(): void {
		register_product_categories_taxonomy();

		$this->assertArrayHasKey( 'product_category', $GLOBALS[ TEST_STATE_KEY ]['taxonomies'] );
		$this->assertSame(
			array( 'product' ),
			$GLOBALS[ TEST_STATE_KEY ]['taxonomies']['product_category']['object_type']
		);
	}

	public function test_taxonomy_rest_and_ui_flags_are_set_correctly(): void {
		register_product_categories_taxonomy();

		$args = $GLOBALS[ TEST_STATE_KEY ]['taxonomies']['product_category']['args'];

		$this->assertTrue( $args['show_in_rest'] );
		$this->assertSame( 'product-categories', $args['rest_base'] );
		$this->assertTrue( $args['hierarchical'] );
		$this->assertTrue( $args['show_admin_column'] );
	}

	public function test_taxonomy_capabilities_are_strictly_edit_posts(): void {
		register_product_categories_taxonomy();

		$args = $GLOBALS[ TEST_STATE_KEY ]['taxonomies']['product_category']['args'];

		$this->assertSame(
			array(
				'manage_terms' => 'edit_posts',
				'edit_terms'   => 'edit_posts',
				'delete_terms' => 'edit_posts',
				'assign_terms' => 'edit_posts',
			),
			$args['capabilities']
		);
	}
}
