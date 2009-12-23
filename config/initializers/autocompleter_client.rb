AutocompleterClient.configure do |config|
  # === Templates ===
  # You have access to username, password, version_number, and model_name in your templates. You have access to the binding as well.

  #  If you want to host all css and javascript locally--set this to "/" defaults to 'http://apps.cla.umn.edu/engine/'
  config.templates.default_base_path = "/"
  
  #  -Site --> The target of your autocompleters to submit too.
  # config.templates.site = "https://<%= username %>:<%= password %>@apps.cla.umn.edu/engine/api/v<%= version_number %>/<%= model_name %>/autocompleter_submit"

  #  -Base javascript include --> The base included javascript used by autocompleter_client_includes
  # config.templates.base_js = "http://apps.cla.umn.edu/engine/javascripts/api/v<%= version_number %>/autocompleter.js"

  #  -Base stylesheet include --> The base included css used by autocompleter_client_includes
  # config.templates.base_css = "http://apps.cla.umn.edu/engine/stylesheets/api/v<%= version_number %>/autocompleter.css"

  #  -Extending javascript include --> The extending javascript file to be included on a per resource basis. Injected to the head.
  #  -- You can specifically remove the extending includes on a per-resource basis by setting the :js => ""
  # config.templates.ext_js = "http://apps.cla.umn.edu/engine/javascripts/api/v<%= version_number %>/<%= resource_name %>_autocompleter.js"

  #  -Extending styleshite include --> The extending css file to be used on a per resource basis. NOTE: These are inlined.
  #  -- You can specifically remove the extending includes on a per-resource basis by setting the :css => ""
  # config.templates.ext_css = "http://apps.cla.umn.edu/engine/stylesheets/api/v<%= version_number %>/<%= resource_name %>_autocompleter.css"

  # === Normal Usage ===
  # The normal usage of this plugin is that you are using one account on the CLA Engine server or other servers 

  # === Account ===
  # config.account = {"username" => "password"}

  # === Version ===
  # Set the API Version Number that you want to use
  # Defaults to config.version = 1
  # config.version = 3

  # === Resources ===
  # Add a resource to auto_complete for
  # Options
  #  - :js      -- specify a custom js url defining the Model's AutoCompleter Class
  #  - :css     -- specify a custom css url for this autocompleter
  #  - :name    -- specify a unique name for the auto_completer if you have more than one autocompleter for the same underlying model ( Defaults to klass.name )
  #                NOTE: this name is used in determining the Autocompleter class if :js => nil
  #  - :site    -- specify the site if the autocompleter server resides at a different location than the rest ( Defaults to config.templates.site )
  #  - :default_options -- specify the default options passed to instances of this autocompleter.
  config.resource "V1::Document"
end
