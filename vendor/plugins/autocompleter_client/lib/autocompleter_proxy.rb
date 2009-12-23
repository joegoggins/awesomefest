# Simple class to target UMN Engine Autocompleters.
# WARNING: This is NOT a general purpose url getter (ALA: GracefulUrlGetter)
#
# === About ===
#  - Supports GET requests.
#  - Expects JSON response
#  - Handles errors
#
# === Example ===
#  ac = AutocompleterProxy.new("ClaPerson", 1, {"username" => "password"})
#  ac.get(:q => "verm0032")
#  

class HostRequired < Exception
end

class AutocompleterProxy
  cattr_accessor :site_template
  cattr_accessor :default_base_path_template
  cattr_accessor :base_js_template
  cattr_accessor :base_css_template
  cattr_accessor :ext_js_template
  cattr_accessor :ext_css_template
  
  cattr_accessor :account
  cattr_accessor :version
  
  # The target site template
  @@site_template = "https://<%= username %>:<%= password %>@apps.cla.umn.edu/engine/api/v<%= version_number %>/<%= model_name %>/autocompleter_submit"

  # The base included javascript and css files.
  

  # Override this if you want all js and css to be hosted/linked to locally rather than to apps.cla/engine.
  #
  @@default_base_path_template = 'https://apps.cla.umn.edu/engine/'

  @@base_js_template = "<%= @@default_base_path_template%>javascripts/api/v<%= version_number %>/autocompleter.js"
  @@base_css_template = "<%= @@default_base_path_template%>stylesheets/api/v<%= version_number %>/autocompleter.css"
 
  # The extending javascript and css files on each resource.
  @@ext_js_template = "<%= @@default_base_path_template%>javascripts/api/v<%= version_number %>/<%= resource_name %>_autocompleter.js"
  @@ext_css_template = "<%= @@default_base_path_template%>stylesheets/api/v<%= version_number %>/<%= resource_name %>_autocompleter.css"

  # == Overview
  #  - Requires a model and version number
  #
  def initialize(options = {})
    @model = options.delete(:model)
    @site = construct_site(options.delete(:site))

    @url = URI.parse @site

    @path = @url.path
    @credentials = [@url.user, @url.password].compact.join(":")
    @credentials = @credentials + "@" unless @credentials.blank?
    @host = "#{@url.scheme}://#{@credentials}#{@url.host}"  
  
    establish_connection  
  end
  
  def self.get_base(which)
    case which
    when :js
      self.new.construct_site(@@base_js_template)
    when :css
      self.new.construct_site(@@base_css_template)
    end
  end

  # == Overview
  #   - params => {:is => "a hash"} 
  #
  def get(params = {:q => ""})

    params ||= {:q => ""}

    if @connection.blank?
      establish_connection  
    end

    @connection.get("#{@path}?#{params.to_query}")
  end

  def construct_site(site, locals = {})
    site ||= @@site_template
    site = ERB.new(site)
    
    model_name = @model.to_s.underscore.pluralize
    version_number = self.version

    username = self.account.keys.first
    password = self.account.values.first
    
    get_binding = self.send(:binding)
    
    locals.each do |lname, rvalue|
      eval("#{lname} = #{rvalue}", get_binding)
    end

    site.result(get_binding)
  end
  
private

  def establish_connection
    unless(@host.blank? or @host == "://")
      @connection = ActiveResource::Connection.new(@host, ActiveResource::Formats[:json])
    else
      raise HostRequired.new("AutocompleterProxy host Required.")
    end
  end
end
