Tracedeson::Application.routes.draw do

  root :to => "intro#index"
  get "home" => "home#index"

  namespace :admin do
    root :to => "media#index"
    devise_for :admins, :module => 'devise'
    resources :media
  end
  
end
