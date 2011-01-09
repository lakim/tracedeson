class Admin < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :registerable, :trackable, :rememberable, :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable,
         :recoverable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
end
