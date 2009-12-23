ActionController::Routing::Routes.draw do |map|
  map.autocompleter_client "/autocompleter_client/:action", :controller => "autocompleter_client"
end
