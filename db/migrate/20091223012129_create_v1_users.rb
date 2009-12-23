class CreateV1Users < ActiveRecord::Migration
  def self.up
    create_table :v1_users do |t|
      t.string :name
      t.string :email

      t.timestamps
    end
  end

  def self.down
    drop_table :v1_users
  end
end
