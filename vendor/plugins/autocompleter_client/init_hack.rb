require 'dispatcher' unless defined?(::Dispatcher)

Dispatcher.to_prepare do 
  if File.exists? "#{Rails.root}/config/initializers/autocompleter_client.rb"
    load "#{Rails.root}/config/initializers/autocompleter_client.rb"
  end
end
