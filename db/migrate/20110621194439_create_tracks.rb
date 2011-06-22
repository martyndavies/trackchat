class CreateTracks < ActiveRecord::Migration
  def self.up
    create_table :tracks do |t|
      t.string :artist
      t.string :title
      t.integer :belongs_to_playlist
      t.string :artist_echonest_id
      t.string :track_echonest_id

      t.timestamps
    end
  end

  def self.down
    drop_table :tracks
  end
end
