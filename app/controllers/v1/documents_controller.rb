class V1::DocumentsController < ApplicationController
  # GET /v1_documents
  # GET /v1_documents.xml
  def index
    @v1_documents = V1::Document.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @v1_documents }
    end
  end

  # GET /v1_documents/1
  # GET /v1_documents/1.xml
  def show
    @document = V1::Document.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @document }
    end
  end

  # GET /v1_documents/new
  # GET /v1_documents/new.xml
  def new
    @document = V1::Document.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @document }
    end
  end

  # GET /v1_documents/1/edit
  def edit
    @document = V1::Document.find(params[:id])
  end

  # POST /v1_documents
  # POST /v1_documents.xml
  def create
    @document = V1::Document.new(params[:document])

    respond_to do |format|
      if @document.save
        flash[:notice] = 'V1::Document was successfully created.'
        format.html { redirect_to(@document) }
        format.xml  { render :xml => @document, :status => :created, :location => @document }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @document.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /v1_documents/1
  # PUT /v1_documents/1.xml
  def update
    @document = V1::Document.find(params[:id])

    respond_to do |format|
      if @document.update_attributes(params[:document])
        flash[:notice] = 'V1::Document was successfully updated.'
        format.html { redirect_to(@document) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @document.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /v1_documents/1
  # DELETE /v1_documents/1.xml
  def destroy
    @document = V1::Document.find(params[:id])
    @document.destroy

    respond_to do |format|
      format.html { redirect_to(v1_documents_url) }
      format.xml  { head :ok }
    end
  end
end
