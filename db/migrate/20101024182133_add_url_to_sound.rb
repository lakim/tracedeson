class AddUrlToSound < ActiveRecord::Migration
  def self.up
    add_column :sounds, :url, :string
  end

  def self.down
    remove_column :sounds, :url
  end
end
