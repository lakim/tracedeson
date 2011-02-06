class HomeController < ApplicationController
  def index
    @sounds = Medium.order('number ASC').find_all_by_type('Sound')
    @videos = Medium.order('number ASC').find_all_by_type('Video')
    
    respond_to do |format|
      format.html
      format.xml  { render :xml => @media }
    end
  end

end
