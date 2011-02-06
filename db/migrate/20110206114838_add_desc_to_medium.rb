class AddDescToMedium < ActiveRecord::Migration
  def self.up
    add_column :media, :desc, :text
    add_column :media, :desc_h, :text
  end

  def self.down
    remove_column :media, :desc
    remove_column :media, :desc_h
  end
end
