require 'test_helper'

class V1::DocumentsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:v1_documents)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create document" do
    assert_difference('V1::Document.count') do
      post :create, :document => { }
    end

    assert_redirected_to document_path(assigns(:document))
  end

  test "should show document" do
    get :show, :id => v1_documents(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => v1_documents(:one).to_param
    assert_response :success
  end

  test "should update document" do
    put :update, :id => v1_documents(:one).to_param, :document => { }
    assert_redirected_to document_path(assigns(:document))
  end

  test "should destroy document" do
    assert_difference('V1::Document.count', -1) do
      delete :destroy, :id => v1_documents(:one).to_param
    end

    assert_redirected_to v1_documents_path
  end
end
