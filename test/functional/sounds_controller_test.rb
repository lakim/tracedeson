require 'test_helper'

class SoundsControllerTest < ActionController::TestCase
  setup do
    @sound = sounds(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sounds)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sound" do
    assert_difference('Sound.count') do
      post :create, :sound => @sound.attributes
    end

    assert_redirected_to sound_path(assigns(:sound))
  end

  test "should show sound" do
    get :show, :id => @sound.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @sound.to_param
    assert_response :success
  end

  test "should update sound" do
    put :update, :id => @sound.to_param, :sound => @sound.attributes
    assert_redirected_to sound_path(assigns(:sound))
  end

  test "should destroy sound" do
    assert_difference('Sound.count', -1) do
      delete :destroy, :id => @sound.to_param
    end

    assert_redirected_to sounds_path
  end
end
