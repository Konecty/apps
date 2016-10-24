AutoForm.addInputType("selectorg",{
    template:"afSelectOrg",
    valueIn: function(val, atts){
        console.log("value in...");
        if("string" == typeof(val))
            val = CFDataManager.getFormulaOrganizations(val);

        if(val instanceof Array && val.length > 0 && "string" == typeof(val[0])){
            val = CFDataManager.getFormulaOrganizations(val);
        }

        return val;
    },
    valueOut:function(){
        return this[0].dataset.values;
    },
    valueConverters:{
        "stringArray" : AutoForm.valueConverters.stringToStringArray,
        "number" : AutoForm.valueConverters.stringToNumber,
        "numerArray" : AutoForm.valueConverters.stringToNumberArray,
        "boolean" : AutoForm.valueConverters.stringToBoolean,
        "booleanArray" : AutoForm.valueConverters.stringToBooleanArray,
        "date" : AutoForm.valueConverters.stringToDate,
        "dateArray" : AutoForm.valueConverters.stringToDateArray
    },
    contextAdjust: function(context){
        if(typeof context.atts.maxlength ==='undefined' && typeof context.max === 'number'){
            context.atts.maxlength = context.max;
        }

        context.atts.class = "selectOrg form-control";

        //context.atts.onclick = 'SelectTag.show({data:{orgs:WorkflowManager.getSpaceOrganizations() , users:WorkflowManager.getSpaceUsers()},multiple:false},\"$(\\\"input[name=\''+context.name+'\']\\\").val(SelectTag.values)\")';
        return context;
    }
});



Template.afSelectOrg.events({
  'click .selectOrg': function (event, template) {
    console.log("show cf_organization_modal");

    if ("disabled" in template.data.atts)
        return;
    //var data = {orgs:WorkflowManager.getSpaceOrganizations()};
    var values = $("input[name='"+template.data.name+"']")[0].dataset.values;

    var options = {};
    //options.data = data;
    options.multiple = template.data.atts.multiple;

    if(values && values.length > 0){
        options.defaultValues = values.split(",");
    }

    options.showUser = false;

    options.targetId = template.data.atts.id;

    Modal.allowMultiple = true;
    Modal.show("cf_organization_modal", options);
  }
});

Template.afSelectOrg.helpers({
    val: function(value){
        if(value){
            var val = '';
            if(value instanceof Array){ //this.data.atts.multiple && (value instanceof Array)
                if(value.length > 0 && typeof(value[0]) == 'object'){
                    val = value ? value.getProperty("fullname").toString() : ''
                    this.atts["data-values"] = value ? value.getProperty("id").toString() : '';
                }else{
                    val = value.toString();
                }
            }else{
                if(value && typeof(value) == 'object'){
                    val = value ? value.fullname : '';
                    this.atts["data-values"] = value ? value.id : '';
                }else{
                    val = value;
                }
            }

            if(this.dataset && "values" in this.dataset){
                this.atts["data-values"] = this.dataset.values;
            }

            return val;
        }
    }
});

Template.afSelectOrg.confirm = function(name){
    var values = SelectTag.values;
    var valuesObject = SelectTag.valuesObject();
    if(valuesObject.length > 0){
        if($("input[name='"+name+"']")[0].multiple){
            $("input[name='"+name+"']")[0].dataset.values = values;
            $("input[name='"+name+"']").val(valuesObject.getProperty("fullname").toString()).trigger("change");
        }else{
            $("input[name='"+name+"']")[0].dataset.values = values[0];
            $("input[name='"+name+"']").val(valuesObject[0].fullname).trigger("change");
        }

    }else{
        $("input[name='"+name+"']")[0].dataset.values = '';
        $("input[name='"+name+"']").val('').trigger("change");
    }

}
