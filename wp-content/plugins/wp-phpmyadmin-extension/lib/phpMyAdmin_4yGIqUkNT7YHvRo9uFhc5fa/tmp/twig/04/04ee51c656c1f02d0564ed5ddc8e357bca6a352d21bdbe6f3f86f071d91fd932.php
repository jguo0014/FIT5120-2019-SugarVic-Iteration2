<?php

/* server/plugins/section_links.twig */
class __TwigTemplate_12c931d4b55a70e1362368b19d95810508431e4e2a46e8666a556281efcf0b7f extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<div id=\"sectionlinks\">
";
        // line 2
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable(twig_get_array_keys_filter(($context["plugins"] ?? null)));
        foreach ($context['_seq'] as $context["_key"] => $context["plugin_type"]) {
            // line 3
            echo "    <a href=\"#plugins-";
            echo twig_escape_filter($this->env, preg_replace("/[^a-z]/", "", twig_lower_filter($this->env, $context["plugin_type"])), "html", null, true);
            echo "\">
        ";
            // line 4
            echo twig_escape_filter($this->env, $context["plugin_type"], "html", null, true);
            echo "
    </a>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['plugin_type'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 7
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "server/plugins/section_links.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  40 => 7,  31 => 4,  26 => 3,  22 => 2,  19 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Twig_Source("", "server/plugins/section_links.twig", "/opt/bitnami/apps/wordpress/htdocs/wp-content/plugins/wp-phpmyadmin-extension/lib/phpMyAdmin_4yGIqUkNT7YHvRo9uFhc5fa/templates/server/plugins/section_links.twig");
    }
}