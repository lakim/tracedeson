class Admin::MediaController < Admin::AdminController
  
  # GET /medias
  # GET /medias.xml
  def index
    @media = Medium.order('type ASC, number ASC').all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @media }
    end
  end

  # GET /medias/1
  # GET /medias/1.xml
  def show
    @medium = Medium.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @medium }
    end
  end

  # GET /medias/new
  # GET /medias/new.xml
  def new
    @medium = Medium.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @medium }
    end
  end

  # GET /medias/1/edit
  def edit
    @medium = Medium.find(params[:id])
  end

  # POST /medias
  # POST /medias.xml
  def create
    @medium = Medium.new(params[:medium])
    @medium.type = params[:medium][:type]

    respond_to do |format|
      if @medium.save
        format.html { redirect_to([:admin, @medium], :notice => 'Medium was successfully created.') }
        format.xml  { render :xml => @medium, :status => :created, :location => @medium }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @medium.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /medias/1
  # PUT /medias/1.xml
  def update
    @medium = Medium.find(params[:id])
     @medium.type = params[:medium][:type]

    respond_to do |format|
      if @medium.update_attributes(params[:medium])
        format.html { redirect_to([:admin, @medium], :notice => 'Medium was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @medium.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /medias/1
  # DELETE /medias/1.xml
  def destroy
    @medium = Medium.find(params[:id])
    @medium.destroy

    respond_to do |format|
      format.html { redirect_to(admin_medias_url) }
      format.xml  { head :ok }
    end
  end
end
