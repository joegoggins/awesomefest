class V1::UsersController < ApplicationController
  # GET /v1_users
  # GET /v1_users.xml
  def index
    @v1_users = V1::User.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @v1_users }
    end
  end

  # GET /v1_users/1
  # GET /v1_users/1.xml
  def show
    @user = V1::User.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /v1_users/new
  # GET /v1_users/new.xml
  def new
    @user = V1::User.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /v1_users/1/edit
  def edit
    @user = V1::User.find(params[:id])
  end

  # POST /v1_users
  # POST /v1_users.xml
  def create
    @user = V1::User.new(params[:user])

    respond_to do |format|
      if @user.save
        flash[:notice] = 'V1::User was successfully created.'
        format.html { redirect_to(@user) }
        format.xml  { render :xml => @user, :status => :created, :location => @user }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /v1_users/1
  # PUT /v1_users/1.xml
  def update
    @user = V1::User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        flash[:notice] = 'V1::User was successfully updated.'
        format.html { redirect_to(@user) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /v1_users/1
  # DELETE /v1_users/1.xml
  def destroy
    @user = V1::User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(v1_users_url) }
      format.xml  { head :ok }
    end
  end
end
