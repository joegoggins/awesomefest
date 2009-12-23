module AutocompleterClientHelpers
  
  # Here we build the includes for the head of the page
  # This includes the base javascript object, the base stylesheet and the google prototype/scritaculous libraries if :include_google is sent
  #
  # We also inject a yield statement, so we can inject more javascript files into the head as needed
  def autocompleter_client_includes(flag = nil)
    includes = ""
    includes << google_proto_script_include if flag == :include_google
    includes << javascript_include_tag(AutocompleterProxy.get_base(:js)) unless AutocompleterProxy.get_base(:js).blank?
    includes << stylesheet_link_tag(AutocompleterProxy.get_base(:css))  unless AutocompleterProxy.get_base(:css).blank?
     
    yield_stmt = render :inline => "<%= yield :autocompleter_client_head %>" 

    includes + yield_stmt
  end
  
  # Just the Google Includes
  def google_proto_script_include
    <<-CODE
      <script type="text/javascript" src="http://www.google.com/jsapi"></script>
      <script type="text/javascript">
        google.load("prototype", "1.6");
        google.load("scriptaculous", "1.8.2")
      </script>
    CODE
  end
  
  # Add the individual javascript include for the autocompleter being used to the head of the page
  # This way, we only load the javascript files that we need (on pages with that specific autocompleter)
  def add_js_file(url)    
    return if url.blank?
    
    unless self.autocompleter_js_includes.include?(url)
      content_for :autocompleter_client_head do
        javascript_include_tag(url)
      end
      self.autocompleter_js_includes << url
    end
    
  end
  
  #Add the CSS file for the autocompleter inline
  def add_css_file(url)
    return "" if url.blank?
    
    # If using a local stylesheet, make sure to add root_path, incase we're deployed to a subdirectory
    # eg, "/stylesheets/autocompleter.css" --> "/hrms/stylesheets/autocompleter.css"
    if url.first == "/"
      url = root_path() + url[1..-1]
    end

    <<-CODE
      <style type="text/css">
        @import url(#{url});
      </style>
    CODE
  end
  
  # Add the magical anchor that the Autocompleter Javascript works off of
  def add_anchor(name)
    <<-CODE
      <a id="#{name}Anchor"></a>
    CODE
  end
  
  # Add the inline javascript (initializing the Autocompleter Class)
  def add_inline_js(name, action, model, js_class, options = {})
    <<-CODE
    <script type="text/javascript">
      var autoCompleter#{self.autocompleter_count}= new UmnEngine.#{js_class}('#{name}', '#{autocompleter_client_path(:action => action)}', $H(#{options.to_json}));
    </script>
    CODE
  end
  
  # Add some variables to the ActionView::Base so we can keep track of 
  # how many autocompleters are on the page, and which javascript files we have included
  def initialize_js_include_on_helpers
    unless self.instance_variables.include? "@autocompleter_js_includes"
      self.instance_eval <<-CODE
        self.class.send :attr_accessor, :autocompleter_js_includes
        self.class.send :attr_accessor, :autocompleter_count
      CODE
    end
    self.autocompleter_js_includes ||= []
    self.autocompleter_count ||= 0
    self.autocompleter_count += 1   
  end
end
