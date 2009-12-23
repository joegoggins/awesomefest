require File.join(File.dirname(__FILE__), 'init_hack')

# Ensure config/routes.rb is read for engine --> 2.3.2 fix
ActionController::Routing::Routes.add_configuration_file(File.join(RAILS_ROOT, 'vendor', 'plugins', 'autocompleter_client', 'config', 'routes.rb'))
