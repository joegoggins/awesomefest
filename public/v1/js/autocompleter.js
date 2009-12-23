/*
== Overview
  - Designed to be used with the CLA-OIT autocompleter rails plugin

== Usage
  - See plugin defaults, .../autocompleter for any resource that uses the plugin

== Options
  - See this.defaults documentation

== Nuance:

   - Checking for "[]" in the name of the autocompleter may not necessarily be essential. (For instance in pearl.)
     We will revist this if necessary, for now, just BE CAREFUL WHAT YOU NAME YOUR AutoCompleter.
	if(this.maxSelections == null || this.maxSelections != 1) {
	  if(!this.name.match(/\[\]/)) {
	    alert('ERROR: Multiple selections are allowed but paramName=' + this.name +' does not end in [].  Make sure to correct the name or set maxSelections=1, otherwise only one submit value will be submitted to server.')	
	  } 
	}
*/



var UmnEngine = {};
UmnEngine.Autocompleter = Class.create(Ajax.Autocompleter, {
  initialize: function($super, formSubmissionParamName, ajaxProxyUrl, options) {
	this.name = formSubmissionParamName;
	this.ajaxProxyUrl = ajaxProxyUrl;

    this.defaults = {
////////////MAIN OVERRIDABLE OPTIONS///////////////
	  // Set this to an array of uniq column values, if uniq_column_value = PER_ID, [1234,2345,3456] will load these as selected when the page loads
	  initialSelections: null, 
	  //Allows the text from the text field to come straight through to allow for things the db does not suggest
      allowCustomChoice: this.allowCustomChoice,
      //Set this to integer to only let the widget have N selections
	  maxSelections: null,
	
///////////Secondary OVERRIDABLE OPTIONS//////////
          onCustomSubmit: this.onCustomSubmit,
          onParameterConstruction: this.onParameterConstruction,

//////////////SERVER SIDE OVERRIDES//////////////
	  //Use to override server default uniq column name for a given model, i.e. UID, instead of PER_ID
	  //Must be an option within possible column names (server side)
	  uniqColumnName: null,
	  // Determines the columns to show, overrides server-side default
          columnsToShow: null, 
          // Determines max results, overrides server-side default
	  maxResults: null,
	
///////// DOM ELEMENT NAMES////////////////
      selectionRemoveClassName: 'selectionRemove',
      customChoiceClassName: 'customChoice',
	  anchorName: this.name + "Anchor",
	  selectionRemoveLabel: 'remove',
	
///////// CLIENT DISPLAY APPEARANCE OVERRIDES//////////////
          selectionTemplateString: null,
          choiceTemplateString: null,
          customChoiceTemplateString: null,
	  selectionAddColumnsToShowToContainer: this.selectionAddColumnsToShowToContainer,
          selectionAddCustomChoiceToContainer: this.selectionAddCustomChoiceToContainer,
	  choiceAddColumnsToShowToContainer: this.choiceAddColumnsToShowToContainer,
          customChoiceAddToContainer: this.customChoiceAddToContainer,
	  customChoiceDisplayTextCallback: this.customChoiceDisplayTextCallback,
	  customChoiceSubmitTextCallback: this.customChoiceSubmitTextCallback,
          inputFieldValueCallback: this.inputFieldValueCallback
    }
	
	//Override defaults if specified in options
	$H(this.defaults).keys().each(function(key) {
	  if($H(options).keys().include(key)) {
            this[key] = $H(options).get(key);
	  }
	  else {
            this[key] = this.defaults[key];
	  }
	}, this);


        /* initialSelections vs maxSelections */ 
        if(this.maxSelections != null && this.initialSelections != null && this.initialSelections.size() > this.maxSelections)
        {
          alert('ERROR: inititialSelections has been supplied with more selections then can be allowed from maxSelections.');
        }
		
	if($(this.anchorName) == null) {
	  alert("a id=\"" + this.anchorName + "\" must be set to use this."); 
	}

	this.addRequiredAutocompleterElementsAfterAnchor();
	default_parent_options = {
//	  paramName:'q',
//	  parameters: this.buildAjaxParameters(),
          callback: this.buildAjaxParameters.bind(this),
	  minChars: 2,
	  indicator: this.loadingIndicatorDomId(),
      updateElement: this.updateElementCallback.bind(this)
	}

        /* Launch an ajax request for initial_selections. */
        if(this.initialSelections)
        {
          this.performInitialSelections();
        }
        
        // Bind the custom onSubmit     
        Event.observe($(this.selectionHiddenFieldsDomId()).up("form"), "submit", this.onCustomSubmit.bindAsEventListener(this));

	/*
	  Call below is to parent constructor:
	  new Ajax.Autocompleter(id_of_text_field, id_of_div_to_populate, url, options)
	*/
        $super(this.textFieldDomId(),this.choicesDomId(), ajaxProxyUrl, default_parent_options);

        // Bind the custom Enter Stopper
        Event.observe($(this.element), "keypress", this.returnKeyStopper.bindAsEventListener(this));
        // Bind the custom text_field clear
        Event.observe($(this.element), "blur", this.clearSearchField.bindAsEventListener(this));
  },

  clearSearchField: function() {
    $(this.element).value = "";
  },
    
  performInitialSelections: function() {
    new Ajax.Request(this.ajaxProxyUrl,
      {
         method: 'post',
         parameters: "initial_selections=" + this.initialSelections + "&" + this.buildAjaxParameters(),
         onSuccess: function(transport) { 
           this.initialAjaxResponse = transport.responseJSON;
           this.initialAjaxResponse.each(function(theJsonOption) {
             this.appendSelectionFromJsonOption(theJsonOption);
             this.appendHiddenFieldFromJsonOption(theJsonOption);
           }, this);
         }.bind(this)
      });
  },

  buildAjaxParameters: function() {
    keyValuePairs = [];
  
    // ESSENTIAL! --> Gets the query from the text_field value... (Ensure the element exists first)
    if(this.element && this.getToken()) {
      keyValuePairs.push('q=' + encodeURIComponent(this.getToken()));
    }

    if(this.uniqColumnName) {
      keyValuePairs.push('uniq_column_name=' + this.uniqColumnName); 	
    }
    if(this.columnsToShow) {
      keyValuePairs.push('columns_to_show=' + this.columnsToShow); 	
    }
    if(this.maxResults) {
      keyValuePairs.push('max_results=' + this.maxResults); 	
    }

    keyValuePairs = keyValuePairs.concat(this.onParameterConstruction()); 

    return keyValuePairs.join('&');
  },


  //==Override this function to inject additional parameters to the ajax parameters
  // Expected to return array of key value pairs ie:
  //   ['testing=something','anotherthing=somethingelse']
  onParameterConstruction: function() {
    return []; 
  },

  onComplete: function(request) {
    if((request.status >= 200 && request.status < 300) || 
        request.status == 0 || 
        request.status == null
       ) {
	  this.lastAjaxJsonResponse = request.responseJSON;
	  this.updateChoices(this.makeChoiceListForParentUpdateChoices());
    }
    else {
   	  alert("TODO: the specified ajaxProxyUrl had problems or returned an invalid result: this.ajaxProxyUrl = " + this.ajaxProxyUrl + "request.status = " + request.status);	
    }
  },

  //returns a DOM tree like: <li><ul><li>Name: Joe</li><li>X500: goggins</li></ul></li>
  appendSelectionFromJsonOption:function(jsonOption) {
    theInnerUl = Builder.node('ul');
    
    if(jsonOption.fromCustomChoice) {
      theInnerUl = this.selectionAddCustomChoiceToContainer(jsonOption.columns_to_show, theInnerUl); 
    }
    else {
      theInnerUl = this.selectionAddColumnsToShowToContainer(jsonOption.columns_to_show, theInnerUl);
    } 

    var theRemoveElement = Builder.node('li',{className:this.selectionRemoveClassName}, this.selectionRemoveLabel);
    Event.observe(theRemoveElement, 'click', this.removeSelectionOnClick.bindAsEventListener(this, jsonOption.uniq_column_value));
    theInnerUl.appendChild(theRemoveElement);
    theOuterLi = Builder.node('li');

    // This is an IE Hack for Write Attribute
    var j_option = document.createAttribute("jsonOptionAsString");
    var uniq_col = document.createAttribute("uniq_column_value");
    j_option.nodeValue = $H(jsonOption).toJSON(); 
    uniq_col.nodeValue = jsonOption.uniq_column_value;
    theOuterLi.setAttributeNode(j_option);
    theOuterLi.setAttributeNode(uniq_col);

    theOuterLi.appendChild(theInnerUl);
    $(this.selectionsDomId()).down().appendChild(theOuterLi);
  },

  appendHiddenFieldFromJsonOption:function(jsonOption) {
	$(this.selectionHiddenFieldsDomId()).appendChild(
	  Builder.node('input', {
		id:'stufff',
		type:'hidden',
		name:this.name,
		value: this.inputFieldValueCallback(jsonOption.uniq_column_value),
		uniq_column_value: jsonOption.uniq_column_value
	  })
	);
  },

  onCustomSubmit: function(event) {
  },

  selectionAddColumnsToShowToContainer:function(columnsToShow, container) {
    var choiceOrSelectionTemplateString = this.selectionTemplateString;
    if(choiceOrSelectionTemplateString == null) { 
      choiceOrSelectionTemplateString = this.choiceTemplateString;
    }

    if(choiceOrSelectionTemplateString != null) {
      var variableHash = this.convertColumnsToShowToHash(columnsToShow);
      var choiceOrSelectionTemplate = new Template(choiceOrSelectionTemplateString);
      container.innerHTML = choiceOrSelectionTemplate.evaluate(variableHash);
    }
    else {
      columnsToShow.each(function(x) {
        columnName = x[0];
        columnValue = x[1];
        container.appendChild(Builder.node('li', {className: columnName}, columnValue)); 
      }, this);
    }
    return container;
  },
 
  selectionAddCustomChoiceToContainer: function(columnsToShow, container) {
    if(this.customChoiceTemplateString != null) {
      var variableHash = this.convertColumnsToShowToHash(columnsToShow);
      var customChoiceTemplate = new Template(this.customChoiceTemplateString);
      container.innerHTML = customChoiceTemplate.evaluate(variableHash);
    }
    else
    {
      columnsToShow.each(function(x) {
        columnName = x[0];
        columnValue = x[1];
        container.appendChild(Builder.node('li', {className: columnName}, columnValue));
      }, this);
    }
    return container;
  },

  choiceAddColumnsToShowToContainer:function(columnsToShow, container) {
    if(this.choiceTemplateString != null) {
      var variableHash = this.convertColumnsToShowToHash(columnsToShow);
      var choiceTemplate = new Template(this.choiceTemplateString);
      container.innerHTML = choiceTemplate.evaluate(variableHash);
    }
    else {
      columnsToShow.each(function(x) {
        columnName = x[0];
        columnValue = x[1];
        container.appendChild(Builder.node('li', {className: columnName}, columnValue)); 
      }, this);
    }
    return container;
  },

  customChoiceAddToContainer: function(columnsToShow, container) {
    if(this.customChoiceTemplateString != null) {
      var variableHash = this.convertColumnsToShowToHash(columnsToShow);
      var customChoiceTemplate = new Template(this.customChoiceTemplateString);
      container.innerHTML = customChoiceTemplate.evaluate(variableHash);
    }
    else
    {
      columnsToShow.each(function(x) {
        columnName = x[0];
        columnValue = x[1];
        container.appendChild(Builder.node('li', {className: columnName}, columnValue));
      }, this);
    }
    return container;
  },

  inputFieldValueCallback: function(uniqColValue) {
    return uniqColValue;
  },

  convertColumnsToShowToHash: function(columnsToShow) {
    var variableHash = new Hash();
    columnsToShow.each(function(x) {
      variableHash.set(x[0], x[1]);
    }, this); 
    return variableHash;
  },

  retrieveValueFromColumnToShow: function(columnsToShow, columnName) {
   // Do found trick.
    var found = "";
    columnsToShow.each(function(x) {
      if(x[0] == columnName)
      {
        found = x[1];
        return;
      }
    }, this);
    return found;
  },

  removeSelectionOnClick:function(event, uniq_column_value) {
    this.removeSelection(uniq_column_value);
  },
 
  removeSelection: function(uniq_column_value) {
    var elems = $(this.selectionHiddenFieldsDomId()).childElements().concat($(this.selectionsDomId()).down().childElements());
    elems.each(function(elem) {
      if(elem.readAttribute('uniq_column_value') == uniq_column_value)
      {
        elem.remove(); 
      }
    });
  },

  checkForExistingSelection:function(uniq_column_value) {
      var elems = $(this.selectionsDomId()).down().childElements();
      var found = false;
      elems.each(function(elem) {
        if(elem.readAttribute('uniq_column_value') == uniq_column_value)
        {
           found = true;
        }
      });
      return found;
  },
  /*
    == Purpose
      - Called when a choice has been selected by parent.
  */
  updateElementCallback: function(selectedChoice) {
    // This function actually replaces AutoCompleter::Base updateElement
    //Zero out the text field now that a selection has been made.
	this.element.value = '';
	this.oldElementValue = '';
	this.element.focus();
	
    var theJsonOption = this.recursiveReadAttribute('jsonOptionAsString', selectedChoice).evalJSON();

    /* Check for maxSelections */
    if(this.maxSelections != null && this.currentSelectionCount() >= this.maxSelections)
    {
       // First in, First out.
       this.removeFirstSelection();
    }

    if(!this.checkForExistingSelection(theJsonOption.uniq_column_value))
    {
      if(selectedChoice.hasClassName(this.customChoiceClassName)) { 
       theJsonOption.fromCustomChoice = true;
       this.appendSelectionFromJsonOption(theJsonOption);
      }
      else {
        this.appendSelectionFromJsonOption(theJsonOption);
      }
      this.appendHiddenFieldFromJsonOption(theJsonOption);
    }

    this.removeChoices();
  },
  
  currentSelectionCount: function() {
    return  $(this.selectionsDomId()).down().childElements().size();
  },
  
  removeFirstSelection: function() {
    // div->ul->li
    this.removeSelection($(this.selectionsDomId()).down(1).readAttribute('uniq_column_value'));
    return true;
  },

  onHover: function(event) {
    // SAFARI HACK
    var element = $(Event.element(event));
    while(!element.hasClassName(this.choicesClassName()))
    {
      element = element.up();
    }
    if(this.index != element.autocompleteIndex) 
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    // SAFARI HACK
    var element = $(Event.element(event));
    while(!element.hasClassName(this.choicesClassName()))
    {
      element = element.up();
    }
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  customChoiceDisplayTextCallback:function() {
	return this.element.value;
  },

  customChoiceSubmitTextCallback:function() {
	return this.element.value;
  },
  allowCustomChoice: function() {
    return false;
  },
  recursiveReadAttribute: function(attribute, target) {
    if(target.hasAttribute(attribute)) {
      return target.readAttribute(attribute); 
    }
    else {
      return recursiveReadAttribute(attribute, target.up());
    }
  },

  removeChoices:function() {
    $(this.choicesDomId()).childElements().each(function(x) { x.remove()}, this);      	
  },
  /*
    == Purpose
      - Parses the JSON ajax response into a list that updateChoices (see parent class) can write to the 
        choices Dom element DOM--must be <ul><li></li>...</ul>, that is what the parent expects
  */
  makeChoiceListForParentUpdateChoices: function() {
    var theContainer = Builder.node('div');
    var theOuterUl = Builder.node('ul');
    if(this.allowCustomChoice()) {
      var theOuterLi = Builder.node('li', {className: this.choicesClassName() + " " + this.customChoiceClassName});

      var j_option = document.createAttribute("jsonOptionAsString");
      var uniq_col = document.createAttribute("uniq_column_value");
      j_option.nodeValue = $H({uniq_column_value:this.customChoiceSubmitTextCallback(), columns_to_show:[[this.customChoiceClassName, this.customChoiceDisplayTextCallback()]]}).toJSON(); 
      uniq_col.nodeValue = this.customChoiceSubmitTextCallback();
      theOuterLi.setAttributeNode(j_option);
      theOuterLi.setAttributeNode(uniq_col);

      theNestedList = Builder.node('ul');
      theNestedList = this.customChoiceAddToContainer([[this.customChoiceClassName, this.customChoiceDisplayTextCallback()]], theNestedList);
      theOuterLi.appendChild(theNestedList);
      theOuterUl.appendChild(theOuterLi);
      //theOuterLi.appendChild(Builder.node('ul',[Builder.node('li',{className:this.customChoiceClassName},this.customChoiceDisplayTextCallback())]));
      //theOuterUl.appendChild(theOuterLi);	
    }

	this.lastAjaxJsonResponse.each(function(jsonOption) {
      var theOuterLi = Builder.node('li', {className: this.choicesClassName()});

      var j_option = document.createAttribute("jsonOptionAsString");
      var uniq_col = document.createAttribute("uniq_column_value");
      j_option.nodeValue = $H(jsonOption).toJSON(); 
      uniq_col.nodeValue = jsonOption.uniq_column_value;
      theOuterLi.setAttributeNode(j_option);
      theOuterLi.setAttributeNode(uniq_col);

      theNestedList = Builder.node('ul');
      theNestedList = this.choiceAddColumnsToShowToContainer(jsonOption.columns_to_show, theNestedList);

      theOuterLi.appendChild(theNestedList);
      theOuterUl.appendChild(theOuterLi);
	}, this);	
	theContainer.appendChild(theOuterUl);
    return theContainer.innerHTML;
  },
  // BEGIN DomId generaor helper functions the object instance references
  containerDomId: function() {
	return "umneContainer_" + this.name;
  },
  textFieldDomId: function() {
	return "umneTextField_" + this.name;
  },
  textFieldDefaultValue: function() {
        return ""; // "Start typing, suggestions will appear.";
  },
  loadingIndicatorDomId: function() {
	return "umneLoadingIndicator_" + this.name;
  },
  choicesDomId: function() {
	return "umneChoices_" + this.name;
  },
  choicesClassName: function() {
     return "umneChoice";
  },
  selectionsDomId: function() {
	return "umneSelections_" + this.name;
  },
  selectionHiddenFieldsDomId: function() {
	return "umneHiddenFields_" + this.name;
  },
  // END DomId generator helper functions the object instance references

  addRequiredAutocompleterElementsAfterAnchor: function() {
    var container = Builder.node('div', { 
	  className: 'umneContainer', 
      id: this.containerDomId()
    });

    var textField = Builder.node('input', { 
	  className: 'umneTextField',
      id: this.textFieldDomId(),
      value: this.textFieldDefaultValue()
    });

	var loadingIndicator = Builder.node('div', { 
	  className: 'umneLoadingIndicator', 
	  style: 'display: none',
      id: this.loadingIndicatorDomId()
    },'...loading...');

	var choices = Builder.node('div', { 
	  className: 'umneChoices',
      id: this.choicesDomId()
    });

	var selections = Builder.node('div', { 
	  className: 'umneSelections',
      id: this.selectionsDomId()
    });
        selections.appendChild(Builder.node('ul'));  

	var selectionHiddenFields = Builder.node('div', { 
	  className: 'selectionHiddenFields',
	  style: 'display: none',
      id: this.selectionHiddenFieldsDomId()
    });

    container.appendChild(textField);
    container.appendChild(loadingIndicator);
    container.appendChild(choices);
    container.appendChild(selections);
    container.appendChild(selectionHiddenFields);
    $(this.anchorName).insert({ after: container });	
  },

  returnKeyStopper: function(e) {
    if((e.keyCode == 13) && (e.target == this.element)) { 
      Event.stop(e);
      return false;
    }
  }  
});
