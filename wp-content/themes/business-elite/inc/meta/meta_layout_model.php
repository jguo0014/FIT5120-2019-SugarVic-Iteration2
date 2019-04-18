<?php
class Business_elite_meta_layout_model extends WDWT_meta_model{
  public $params;
  function __construct(){
    $this->params = array(
      'default_layout' => array(
        "name" => "default_layout",
        "title" => __("Choose Default Layout",WDWT_LANG),
        'type' => 'layout_open',
        "description" => __( "Select the default layout for pages and posts on the website.", WDWT_LANG ),
        'valid_options' => array(
          array('index' => '1', 'title'=>'No Sidebar', 'description'=>''),
          array('index' => '2', 'title'=>'Right Sidebar', 'description'=>''),
          array('index' => '3', 'title'=>'Left Sidebar', 'description'=>''),
          array('index' => '4', 'title'=>'Two Right Sidebars', 'description'=>''),
          array('index' => '5', 'title'=>'Two Left Sidebars', 'description'=>''),
          array('index' => '6', 'title'=>'One Right One Left Sidebars', 'description'=>''),
        ),
        'show' => array(
          '2'=>'main_column',
          '3'=>'main_column',
          '4'=>array('main_column', 'pwa_width'),
          '5'=>array('main_column', 'pwa_width'),
          '6'=>array('main_column', 'pwa_width'),
        ),
        'hide' => array(),
        'img_src' => 'sprite-layouts.png',
        'img_height' => 289,
        'img_width' => 50,
        'default' =>  $this->get_param('default_layout'),
      ),
      'full_width' => array(
        "name" => "full_width",
        "title" => __( "Full Width", WDWT_LANG),
        'type' => 'checkbox_open',
        'show' => array(),
        'hide' => array('content_area_percent', 'content_area_percent_large'),
        "description" => __( "You can choose full width for pages and posts on the website.", WDWT_LANG),
        'default' => $this->get_param('full_width'),
      ),
      'content_area_percent' => array(
        "name" => "content_area_percent",
        "title" => __( "Content Area Width", WDWT_LANG),
        'type' => 'number',
        'min' => '75',
        'max' => '99',
        "sanitize_type" => "sanitize_text_field",
        "description" => __( "Content Area Width", WDWT_LANG),
        'unit_symbol' => '%',
        'input_size' => '2',
        'default' => $this->get_param('content_area_percent'),
      ),
      'content_area_percent_large' => array(
        "name" => "content_area_percent_large",
        "title" => __( "Content Area Width on Large Desktop Screens", WDWT_LANG),
        'type' => 'number',
        'min' => '50',
        'max' => '99',
        "sanitize_type" => "sanitize_text_field",
        "description" => __( "Content Area Width on Large Desktop Screens", WDWT_LANG),
        'unit_symbol' => '%',
        'input_size' => '2',
        'default' => $this->get_param('content_area_percent_large'),
      ),
      'main_column' => array(
        "name" => "main_column",
        "title" => __("Main Column Width",WDWT_LANG),
        'type' => 'number',
        "sanitize_type" => "sanitize_text_field",
        "description" => __("Specify the width of the Main Column", WDWT_LANG),
        'unit_symbol' => '%',
        'input_size' => '2',
        'min' => '30',
        'max' => '100',
        'default' => $this->get_param('main_column'),
      ),
      'pwa_width' => array(
        "name" => "pwa_width",
        "title" => __("Primary Widget Area width", WDWT_LANG),
        'type' => 'number',
        "sanitize_type" => "sanitize_text_field",
        "description" => __("Specify the width of the Primary Widget Area", WDWT_LANG),
        'unit_symbol' => '%',
        'input_size' => '2',
        'min' => '0',
        'max' => '60',
        'default' => $this->get_param('pwa_width'),
      ),

      'show_featured_image' => array(
        'name' => 'show_featured_image',
        'title' => __( 'Featured Image', WDWT_LANG ),
        'type' => 'checkbox',
        'description' => __( 'Show Featured Image in single page/post view', WDWT_LANG ),
        'default' => $this->post_type_check() == 'page' ? false : true ,
      ),
    );
  }
}