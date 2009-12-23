class AutocompleterClientGenerator < Rails::Generator::Base
  def manifest
    record do |m|
      m.file 'initializer.rb', "config/initializers/autocompleter_client.rb"
    end
  end
end
