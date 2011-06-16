class HomeController < ApplicationController
  include HTTParty
  
  def index
    
  end
  
  def get_tweets
    Twitter.configure do |config|
      config.consumer_key = '4F4D2lnb2bNFqLjtgrg'
      config.consumer_secret = 'iZmYnqrey88Fr5gN9WNGR0VspFmBucLoKbHCDcMVQ'
      config.oauth_token = session['token']
      config.oauth_token_secret = session['secret']
    end
    client ||= Twitter::Client.new
    @tweets = client.home_timeline(:trim_user => true, :count => "35")
    respond_to do |format|
      format.json do
        render :json => {
          :data => {
            :tweets => @tweets
          }
        }
      end
    end
  end

end
