class Medium < ActiveRecord::Base

  @child_classes = []
  
  before_save :desc_to_html

  def self.inherited(child)
    @child_classes << child
    super # important!
  end

  def self.child_classes
    @child_classes
  end
  
  def self.model_name
    name = "medium"
    name.instance_eval do
      def plural;   pluralize;   end
      def singular; singularize; end
      def human;    singularize; end # only for Rails 3
    end
    return name
  end
  
  private
  
  def desc_to_html
    self.desc_h = RedCloth.new(desc).to_html.gsub(/\<a /, '<a target="_blank" ')
  end
  
end
