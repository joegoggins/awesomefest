class AddV1AutocompleterIndexToDocuments < ActiveRecord::Migration
  def self.up
    execute "alter table v1_documents engine=MyISAM"
    execute "alter table `v1_documents` add fulltext `autocompleter_full_text_index`(`title`, `keywords`, `questions`, `description`, `body`)"
  end

  def self.down
  end
end
