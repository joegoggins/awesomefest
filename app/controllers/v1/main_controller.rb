class V1::MainController < ApplicationController
  layout 'v1/application'
  def index
    
  end
  
  def jq1
    respond_to do |format|
      format.html {render :text => 'asdf' }
      format.json { render :text => %w(x y z).to_json}
    end
  end

end
