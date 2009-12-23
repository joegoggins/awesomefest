class AutocompleterClient
  attr_accessor :account
  attr_accessor :resources
  attr_accessor :version
  
  def initialize
    self.resources = {}
    self.account = {}
    self.version = 1
  end
  
  def self.configure
    @@__instance__ = self.new
    
    begin
      yield @@__instance__
    rescue ActiveRecord::StatementInvalid; end
    
    @@__instance__.magic!
    @@__instance__
  end
  
  def self.instance
    @@__instance__
  end
  
  def resource(klass, options = {})
    name  = options.delete(:name)    || klass.underscore.gsub("/", "_")
    css   = options.delete(:css)
    js    = options.delete(:js)
    site  = options.delete(:site)    
    optns = options.delete(:default_options)
    
    self.resources[name] = {:model => klass, :css => css, :js => js, :site => site, :default_options => optns, :action => name.underscore.gsub("/", "_")}
  end

  def templates
    Template
  end

  class Template
    def self.method_missing(m, *args)
      if ["site=", "base_css=", "base_js=", "ext_css=", "ext_js=", "default_base_path="].include? m.to_s
        method = m.to_s.split("=").first
        AutocompleterProxy.send("#{method}_template=", args.first)
      else
        super
      end
    end
  end
  
  # do injections
  def magic!
    AutocompleterProxy.version = self.version
    AutocompleterProxy.account = self.account
    
    set_default_js_and_css!
    set_default_options!
    
    inject_into_controller!
    inject_into_helper!
  end
  
  def set_default_js_and_css!
    self.resources.each do |resource_name, r|
      if r[:js].nil?
        r[:js] = AutocompleterProxy.new(:model => r[:model]).construct_site(AutocompleterProxy.ext_js_template, {"resource_name" => "'#{resource_name}'"})
      end
      if r[:css].nil?
        r[:css] = AutocompleterProxy.new(:model => r[:model]).construct_site(AutocompleterProxy.ext_css_template, {"resource_name" => "'#{resource_name}'"})
      end
    end
  end 
  
  def set_default_options!
    self.resources.each do |resource_name, r|
      if r[:default_options].nil?
        r[:default_options] = {}
      end
    end
  end
  
  def inject_into_controller!
    been_there = []
    self.resources.each do |resource_name, r| # {:resource_name => r} r being the hash of options for that resource
      method_name = "#{r[:action]}"
      
      if r[:site] 
        args = ":site => '#{r[:site]}'"  
      else
        args = ":model => '#{r[:model]}', :account => {'#{self.account.keys.first}' => '#{self.account.values.first}'}"
      end

      if(r[:site] and r[:site].first == "/")
        method = <<-CODE
          def #{method_name}
           redirect_to root_path()[0..-2] + "#{r[:site]}?" + params.to_query
          end
        CODE
      else
        method = <<-CODE
          def #{method_name}
            acp = AutocompleterProxy.new({#{args}})          
            render :json => acp.get(params).to_json and return
          end
        CODE
    end        

      AutocompleterClientController.class_eval(method)
        
      been_there << method_name
    end
  end
  
  def inject_into_helper!
    self.resources.each do |resource_name, r|
      js_class = r[:js].split("/").last.to_s.split(".").first.to_s.camelize
      js_class = js_class.empty? ? "Autocompleter" : js_class
      
      singular_method = <<-CODE
        def #{resource_name}_autocompleter(name = '#{resource_name}', options = {:maxSelections => 1})
          initialize_js_include_on_helpers          
          add_js_file("#{r[:js]}")
          
          add_css_file("#{r[:css]}") +
          add_anchor(name) + 
          add_inline_js(name, '#{r[:action]}', '#{r[:model]}', '#{js_class}', #{r[:default_options].inspect}.merge(options))
        end
      CODE
      
      multiple_method = <<-CODE
        def #{resource_name.pluralize}_autocompleter(name = '#{resource_name.pluralize}', options = {})
          initialize_js_include_on_helpers          
          add_js_file("#{r[:js]}")
      
          add_css_file("#{r[:css]}") +
          add_anchor(name + '[]') +
          add_inline_js(name + '[]', '#{r[:action]}', '#{r[:model]}', '#{js_class}', #{r[:default_options].inspect}.merge(options))
        end
      CODE
      
      AutocompleterClientHelpers.class_eval(singular_method)
      AutocompleterClientHelpers.class_eval(multiple_method)
    end
    
    ActionView::Base.send(:include, AutocompleterClientHelpers)
  end
  
  # allows access to the instance methods, through the class 
  # (AutocompleterClient.resources rather than AutocompleterClient.instance.resources)
  def self.method_missing(*args)
    if self.instance.respond_to?(args.first)
      self.instance.send(args.first, *args[1..-1]) 
    else
      super
    end
  end
end
