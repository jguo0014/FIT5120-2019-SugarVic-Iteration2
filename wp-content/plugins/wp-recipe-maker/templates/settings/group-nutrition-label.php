<?php
/**
 * Template for the plugin settings structure.
 *
 * @link       http://bootstrapped.ventures
 * @since      3.0.0
 *
 * @package    WP_Recipe_Maker
 * @subpackage WP_Recipe_Maker/templates/settings
 */

$nutrition_label = array(
	'id' => 'nutritionLabel',
	'name' => __( 'Nutrition Label', 'wp-recipe-maker' ),
	'required' => 'premium',
	'subGroups' => array(
		array(
			'name' => __( 'Display Manually', 'wp-recipe-maker' ),
			'description' => __( 'Type the [wprm-nutrition-label] or [wprm-nutrition-label id="123" align="center"] shortcode where you want the label to appear.', 'wp-recipe-maker' ),
			'documentation' => 'https://help.bootstrapped.ventures/article/22-nutrition-label',
		),
		array(
			'name' => __( 'Display Automatically', 'wp-recipe-maker' ),
			'dependency' => array(
				'id' => 'recipe_template_mode',
				'value' => 'legacy',
			),
			'settings' => array(
				array(
					'id' => 'show_nutrition_label',
					'name' => __( 'Nutrition Label in template', 'wp-recipe-maker' ),
					'description' => __( 'Display the nutrition label at its default location in the recipe template.', 'wp-recipe-maker' ),
					'type' => 'dropdown',
					'options' => array(
						'disabled' => __( "Don't show", 'wp-recipe-maker' ),
						'left' => __( 'Show - Aligned Left', 'wp-recipe-maker' ),
						'center' => __( 'Show - Aligned Center', 'wp-recipe-maker' ),
						'right' => __( 'Show - Aligned Right', 'wp-recipe-maker' ),
					),
					'default' => 'disabled',
				),
			),
		),
		array(
			'name' => __( 'Customize', 'wp-recipe-maker' ),
			'settings' => array(
				array(
					'id' => 'nutrition_label_zero_values',
					'name' => __( 'Show values when 0', 'wp-recipe-maker' ),
					'description' => __( 'Show nutrient in the nutrition label when it has a value of 0.', 'wp-recipe-maker' ),
					'type' => 'toggle',
					'default' => false,
				),
				array(
					'id' => 'nutrition_label_custom_daily_values',
					'name' => __( 'Use custom daily intake values', 'wp-recipe-maker' ),
					'description' => __( 'Enable to customize the values used to calculate the daily intake percentage.', 'wp-recipe-maker' ),
					'type' => 'toggle',
					'default' => false,
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_disclaimer',
					'name' => __( 'Daily Values Disclaimer', 'wp-recipe-maker' ),
					'type' => 'text',
					'default' => __( 'Percent Daily Values are based on a 2000 calorie diet.', 'wp-recipe-maker-premium' ),
				),
			),
		),
		array(
			'name' => __( 'Custom Daily Intake Values', 'wp-recipe-maker' ),
			'dependency' => array(
				'id' => 'nutrition_label_custom_daily_values',
				'value' => true,
			),
			'settings' => array(
				array(
					'id' => 'nutrition_label_custom_daily_values_carbohydrates',
					'name' => __( 'Carbohydrates', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'g',
					'default' => '300',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_protein',
					'name' => __( 'Protein', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'g',
					'default' => '50',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_fat',
					'name' => __( 'Total Fat', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'g',
					'default' => '65',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_saturated_fat',
					'name' => __( 'Saturated Fat', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'g',
					'default' => '20',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_cholesterol',
					'name' => __( 'Cholesterol', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'mg',
					'default' => '300',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_sodium',
					'name' => __( 'Sodium', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'mg',
					'default' => '2400',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_potassium',
					'name' => __( 'Potassium', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'mg',
					'default' => '3500',
				),
				array(
					'id' => 'nutrition_label_custom_daily_values_fiber',
					'name' => __( 'Fiber', 'wp-recipe-maker' ),
					'type' => 'number',
					'suffix' => 'g',
					'default' => '25',
				),
			),
		),
	),
);

if ( class_exists( 'WPRM_Addons' ) && ! WPRM_Addons::is_active( 'pro' ) ) {
	$nutrition_label['description'] = __( 'Get the Pro Bundle to have our Nutrition API integration help calculate the nutrition facts for you.', 'wp-recipe-maker' );
	$nutrition_label['documentation'] = 'https://help.bootstrapped.ventures/article/21-nutrition-facts-calculation';
}
