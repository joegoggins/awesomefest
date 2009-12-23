UmnEngine.V1DocumentAutocompleter = Class.create(UmnEngine.Autocompleter, {
  initialize: function($super, formSubmissionParamName, ajaxProxyUrl, options) { 
    this.choiceTemplateString = "" + 
  "<li class='person'>"+ 
  "  <div class='name'>"+ 
  "    <span class='name'>#{title}, #{keywords}</span>"+ 
  "  </div>"+ 
  "  <div class='informal'>"+ 
  "    <span class='emplid'>#{description}</span><br />"+ 
  "    <span class='x500'>#{questions}</span><br />"+ 
  "    <span class='phone'>#{body}</span><br />"+ 
  "  </div>"+ 
  "</li>";

    //set options if you like:
    // IE: options.set("maxSelections", 1);
    //var options = new Hash();   
    options = $H({choiceTemplateString: this.choiceTemplateString}).merge(options);

    $super(formSubmissionParamName, ajaxProxyUrl, options);
  }
});
