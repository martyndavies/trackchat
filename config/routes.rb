Trackchat::Application.routes.draw do
  resources :tracks

  resources :playlists

  root :to => "home#index"

  match "/auth/:provider/callback" => "sessions#create"
  match "/signout" => "sessions#destroy", :as => :signout
  match "/tweets(.:format)" => "home#get_tweets", :as => :tweets
end
