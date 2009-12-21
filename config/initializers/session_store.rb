# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_awesomefest_session',
  :secret      => 'c7d34322a121673838674233b2edcd33ef3d8799c65e19ff466645634143178e5355d25e4e6e29a60e5620fe5ce6a9a7ea8e1863ecab7be30af9a8b6fd25dc00'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
