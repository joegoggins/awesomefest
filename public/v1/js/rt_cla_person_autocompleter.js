UmnEngine.RtClaPersonAutocompleter = Class.create(UmnEngine.Autocompleter, {
  initialize: function($super, formSubmissionParamName, ajaxProxyUrl, options) { 
    this.choiceTemplateString = "" + 
  "<li class='person'>"+ 
  "  <div class='name'>"+ 
  "     #{title}, #{keywords}"+ 
  "  </div>"+ 
  "  <div class='informal'>"+ 
  "    <div class='x500'>#{description}</div>"+ 
  "    <div class='phone'>#{questions}</div>"+
  "    <div class='office'>#{body}</div>"+
  "  </div>"+ 
  "</li>";

    this.customChoiceTemplateString = "" +
  "<li class='person'>"+ 
  "  <div class='name'>"+ 
  "     Somethin different: <br/>"+
  "     #{customChoice}"+ 
  "  </div>"+ 
  "</li>";

    //set options if you like:
    // IE: options.set("maxSelections", 1);
   // var options = new Hash();   
   // options.set('uniqColumnName', "UID"); DOES NOT WORK THIS WAY

    options = $H({choiceTemplateString: this.choiceTemplateString, customChoiceTemplateString: this.customChoiceTemplateString}).merge(options);
    $super(formSubmissionParamName, ajaxProxyUrl, options);
  },

  allowCustomChoice: function() {
    return true;
  },
  
  inputFieldValueCallback: function(uniqColValue) {

      return uniqColValue;
  },
  
  /*onCustomSubmit: function(event) {
    var emails = "";
    $(this.selectionHiddenFieldsDomId()).childElements().each( function(hiddenInput) {
      emails += hiddenInput.value + ";"; 
      hiddenInput.remove(); 
    }, this); 

    var final_submission = Builder.node('input',{type:'hidden', name:this.name, value: emails}); 
    $(this.selectionHiddenFieldsDomId()).appendChild(final_submission);
  }*/
});
