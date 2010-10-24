class HomeController < ApplicationController
  def index
    @sounds = Sound.all
    
    respond_to do |format|
      format.html
      format.xml  { render :xml => @sounds }
    end
  end

end
