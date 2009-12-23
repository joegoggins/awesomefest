require 'test_helper'

class V1::UsersControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:v1_users)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create user" do
    assert_difference('V1::User.count') do
      post :create, :user => { }
    end

    assert_redirected_to user_path(assigns(:user))
  end

  test "should show user" do
    get :show, :id => v1_users(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => v1_users(:one).to_param
    assert_response :success
  end

  test "should update user" do
    put :update, :id => v1_users(:one).to_param, :user => { }
    assert_redirected_to user_path(assigns(:user))
  end

  test "should destroy user" do
    assert_difference('V1::User.count', -1) do
      delete :destroy, :id => v1_users(:one).to_param
    end

    assert_redirected_to v1_users_path
  end
end
