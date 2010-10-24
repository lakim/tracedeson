class RenameSoundsToMedia < ActiveRecord::Migration
  def self.up
    rename_table :sounds, :media
    add_column :media, :type, :string
  end

  def self.down
    remove_column :media, :type
    rename_table :media, :sounds
  end
end
