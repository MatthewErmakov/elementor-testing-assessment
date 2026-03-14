<?php
/**
 * Theme bootstrap for Hello Elementor Child.
 *
 * @since 1.0.0
 */

namespace MYHelloElementorChild;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

foreach ( glob( __DIR__ . '/includes/*.php' ) as $include_file ) {
	require_once $include_file;
}
