require 'active_record'
require 'sqlite3'
require 'csv'

ActiveRecord::Base.establish_connection(
  adapter: 'sqlite3',
  database: '/home/artur/dev-works/protractor/conf/pcs.db'
)

class Outs < ActiveRecord::Base
  CSV.foreach('/home/artur/dev-works/protractor/conf/postcode-outcodes.csv') do |row|
    find_or_create_by(code: "#{row[1]}") do |pc|
    pc.lat = row[2]
    pc.long = row[3]
    end
  end
end