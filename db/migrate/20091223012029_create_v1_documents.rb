class CreateV1Documents < ActiveRecord::Migration
  def self.up
    create_table :v1_documents do |t|
      t.integer :created_by_user_id
      t.integer :owned_by_user_id
      t.string :title
      t.string :keywords
      t.text :questions
      t.text :description
      t.text :body

      t.timestamps
    end
  end

  def self.down
    drop_table :v1_documents
  end
end
