class HomeController < ApplicationController
  def index
    @media = Medium.all
    
    respond_to do |format|
      format.html
      format.xml  { render :xml => @media }
    end
  end

end
