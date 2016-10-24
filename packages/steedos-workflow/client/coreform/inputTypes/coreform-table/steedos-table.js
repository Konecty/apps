SteedosTable = {};

SteedosTable.formId = "instanceform";

SteedosTable.checkItem = function(field, item_index) {
    var fieldObj = SteedosTable.getField(field);

    var fieldVal = SteedosTable.getItemModalValue(field, item_index);

    var sf_name = '';
    var rev = true;
    fieldObj.sfields.forEach(function(sf) {
        if (sf.permission == 'editable') {
            sf_name = fieldObj.code + "." + sf.code;
            if (!InstanceManager.checkFormFieldValue($("[name='" + sf_name + "']")[0])) {
                rev = false;
            }
        }
    });

    return rev;
}

SteedosTable.setTableItemValue = function(field, item_index, item_value) {

    var tableValue = SteedosTable.getTableValue(field);
    tableValue[item_index] = item_value;
}

SteedosTable.getTableItemValue = function(field, item_index) {
    return SteedosTable.getTableValue(field)[item_index];
}

SteedosTable.removeTableItem = function(field, item_index) {
    var item_value = SteedosTable.getTableItemValue(field, item_index);
    item_value.removed = true;
}

SteedosTable.setTableValue = function(field, value) {
    $("table[name='" + field + "']").val({
        val: value
    });
}

SteedosTable.getTableValue = function(field) {
    return $("table[name='" + field + "']").val().val;
}

SteedosTable.getValidValue = function(field) {
    var value = SteedosTable.getTableValue(field);

    if (!value) {
        return
    }

    var validValue = [];

    value.forEach(function(v) {
        if (!v.removed) {
            validValue.push(v);
        }
    });
    return validValue;
}


SteedosTable.handleData = function(field, values) {

    if (!values || !(values instanceof Array)) {
        return values;
    }

    var fieldObj = SteedosTable.getField(field);

    values.forEach(function(v) {
        fieldObj.sfields.forEach(function(f) {
            if (f.type == 'user' || f.type == 'group') {
                var value = v[f.code]
                if (f.is_multiselect) {
                    if (value && value.length > 0 && typeof(value[0]) == 'object') {
                        v[f.code] = v[f.code].getProperty("id");
                    }
                } else {
                    if (value && typeof(value) == 'object') {
                        v[f.code] = v[f.code].id;
                    }
                }
            } else if (f.type == 'dateTime') {
                var value = v[f.code]
                if (value) {
                    if (value.length == 16) {
                        var t = value.split("T");
                        var t0 = t[0].split("-");
                        var t1 = t[1].split(":");

                        year = t0[0];
                        month = t0[1];
                        date = t0[2];
                        hours = t1[0];
                        seconds = t1[1];
                        value = new Date(year, month - 1, date, hours, seconds);
                        v[f.code] = value;
                    }

                }
            }
        });
    });
    return values;
}

SteedosTable.getField = function(field) {
    var instanceFields = WorkflowManager.getInstanceFields();
    if (!instanceFields)
        return;

    var fieldObj = instanceFields.findPropertyByPK("code", field);

    return fieldObj;
}


SteedosTable.getModalData = function(field, index) {

    var data = {};

    var fieldObj = SteedosTable.getField(field);

    if (!fieldObj) {
        return;
    }

    data.field = fieldObj;

    data.field.formula = Form_formula.getFormulaFieldVariable("Form_formula.field_values", fieldObj.sfields);

    data.value = {};

    data.value[field] = SteedosTable.getTableItemValue(field, index);

    data.index = index;

    return data;
}



SteedosTable.getItemModalValue = function(field, item_index) {

    if (!AutoForm.getFormValues("steedos_table_modal_" + field + "_" + item_index)) {
        return {}
    }

    var item_value = AutoForm.getFormValues("steedos_table_modal_" + field + "_" + item_index).insertDoc[field];
    return item_value;
}


SteedosTable.addItem = function(field, index) {
    var keys = SteedosTable.getKeys(field);
    var item_value = SteedosTable.getItemModalValue(field, index);
    $("tbody[name='" + field + "Tbody']").append(SteedosTable.getTr(keys, item_value, index, field, true))

}

SteedosTable.updateItem = function(field, index) {

    var item = $("tr[name='" + field + "_item_" + index + "']");

    var item_value = SteedosTable.getItemModalValue(field, index);

    if (item && item.length > 0) {
        var keys = SteedosTable.getKeys(field);
        var tds = SteedosTable.getRemoveTd(field, index);

        var sfields = SteedosTable.getField(field).sfields;

        keys.forEach(function(key) {
            var sfield = sfields.findPropertyByPK("code", key);

            var value = item_value[key];

            tds = tds + SteedosTable.getTd(sfield, index, value);

        });

        item.empty();

        item.append(tds);

    } else {

        SteedosTable.addItem(field, index);
    }

    if (SteedosTable.getTableValue(field)) {

        SteedosTable.setTableItemValue(field, index, item_value);

        //SteedosTable.valueHash[field][index] = item_value;

    } else {
        //SteedosTable.valueHash[field] = [item_value];

        SteedosTable.setTableValue(field, [item_value])

    }

    //执行主表公式计算
    InstanceManager.runFormula(field);

}

SteedosTable.removeItem = function(field, index) {

    $("tr[name='" + field + "_item_" + index + "']").hide();

    SteedosTable.removeTableItem(field, index);

    InstanceManager.runFormula(field);
}

SteedosTable.showModal = function(field, index, method) {


    var modalData = SteedosTable.getModalData(field, index);

    modalData.method = method;

    Modal.show("steedosTableModal", modalData);

    $(".steedos-table-modal-body").css("max-height", ($(window).height() - 180) + "px");

}

SteedosTable.getKeys = function(field) {
    if (!AutoForm.getCurrentDataForForm(SteedosTable.formId)) {
        return [];
    }

    var ss = AutoForm.getFormSchema(SteedosTable.formId);

    var keys = [];

    if (ss.schema(field + ".$").type === Object) {
        keys = ss.objectKeys(SimpleSchema._makeGeneric(field) + '.$')
    }

    return keys;

}

SteedosTable.getThead = function(field, editable) {

    var fieldObj = SteedosTable.getField(field);

    if (!fieldObj) {
        return '';
    }

    var thead = '',
        trs = '',
        label = '',
        width = 100;

    if (editable) {
        trs = "<th class='removed'></th>"
    }

    var sfields = fieldObj.sfields;

    var sf_length = sfields.length;

    if (sf_length > 0) {
        var wide_fields = sfields.filterProperty("is_wide", true);

        width = 100 / (sf_length + wide_fields.length);
    }

    sfields.forEach(function(sf, index) {

        label = (sf.name != null && sf.name.length > 0) ? sf.name : sf.code;

        trs = trs + "<th nowrap='nowrap' ";

        trs = trs + " class='title " + sf.type + "'";

        if (index != (sf_length - 1)) {
            if (sf.is_wide) {
                trs = trs + "style='width:" + width * 2 + "%'"
            } else {
                trs = trs + "style='width:" + width + "%'"
            }
        }

        trs = trs + ">" + label + "</th>"
    });

    thead = '<tr>' + trs + '</tr>';

    return thead;
}

SteedosTable.getTbody = function(keys, field, values, editable) {
    var tbody = "";

    if (values instanceof Array) {
        values.forEach(function(value, index) {
            tbody = tbody + SteedosTable.getTr(keys, value, index, field, editable);
        });
    }

    return tbody;
}

SteedosTable.getTr = function(keys, item_value, index, field, editable) {
    var tr = "<tr id='" + field + "_item_" + index + "' name='" + field + "_item_" + index + "' data-index='" + index + "'"

    if (editable) {
        tr = tr + "' class='item edit'"
    } else {
        tr = tr + " class='item'"
    }

    if (item_value.removed) {
        tr = tr + " style='display:none' ";
    }

    tr = tr + "'>";

    var tds = "";

    if (editable) {
        tds = SteedosTable.getRemoveTd(field, index);
    }

    var sfields = SteedosTable.getField(field).sfields;

    keys.forEach(function(key) {
        var sfield = sfields.findPropertyByPK("code", key);

        var value = item_value[key];

        tds = tds + SteedosTable.getTd(sfield, index, value);

    });

    tr = tr + tds + "</tr>";
    return tr;
}

SteedosTable.getRemoveTd = function(field, index) {
    return "<td class='steedosTable-item-remove removed' data-index='" + index + "'><i class='fa fa-times' aria-hidden='true'></td>";
}

SteedosTable.getTd = function(field, index, value) {
    var td = "<td ";

    td = td + " class='steedosTable-item-field " + field.type + "' ";

    td = td + " data-index='" + index + "'>" + SteedosTable.getTDValue(field, value) + "</td>"

    return td;
}


SteedosTable.getTDValue = function(field, value) {
    var td_value = "";
    if (!field) {
        return td_value
    }
    try {

        switch (field.type) {
            case 'user':
                if (value) {
                    if (field.is_multiselect) {
                        if (value.length > 0) {
                            if ("string" == typeof(value[0])) {
                                td_value = CFDataManager.getFormulaSpaceUsers(value).getProperty("name").toString();
                            } else {
                                td_value = value.getProperty("name").toString();
                            }
                        }
                    } else {
                        if ("string" == typeof(value)) {
                            var u = CFDataManager.getFormulaSpaceUsers(value);
                            td_value = u ? u.name : '';
                        } else {
                            td_value = value.name;
                        }
                    }
                }
                break;
            case 'group':
                if (value) {
                    if (field.is_multiselect) {
                        if (value.length > 0) {
                            if ("string" == typeof(value[0])) {
                                td_value = CFDataManager.getFormulaOrganizations(value).getProperty("name").toString();
                            } else {
                                td_value = value.getProperty("name").toString();
                            }
                        }
                    } else {
                        if ("string" == typeof(value)) {
                            var o = CFDataManager.getFormulaOrganization(value);
                            td_value = o ? o.name : '';
                        } else {
                            td_value = value.name;
                        }
                    }
                }
                break;
            case 'checkbox':
                if (value === true || value == 'true') {
                    td_value = TAPi18n.__("form_field_checkbox_yes");
                } else {
                    td_value = TAPi18n.__("form_field_checkbox_no");
                }
                break;
            case 'email':
                td_value = value ? "<a href='mailto:" + value + "'>" + value + "</a>" : "";
                break;
            case 'url':
                td_value = value ? "<a href='http://" + value + "' target='_blank'>http://" + value + "</a>" : "";
                break;
            case 'password':
                td_value = '******';
                break;
            case 'date':
                if (value) {
                    if (value.length == 10) {
                        var t = value.split("-");
                        year = t[0];
                        month = t[1];
                        date = t[2];
                        value = new Date(year, month - 1, date);
                    } else {
                        value = new Date(value)
                    }
                    td_value = $.format.date(value, 'yyyy-MM-dd');
                }
                break;
            case 'dateTime':
                if (value) {
                    if (value.length == 16) {
                        var t = value.split("T");
                        var t0 = t[0].split("-");
                        var t1 = t[1].split(":");

                        year = t0[0];
                        month = t0[1];
                        date = t0[2];
                        hours = t1[0];
                        seconds = t1[1];

                        value = new Date(year, month - 1, date, hours, seconds);

                    } else {

                        value = new Date(value)
                    }
                    td_value = $.format.date(value, 'yyyy-MM-dd HH:mm');
                }
                break;
            case 'number':
                if (value || value == 0) {
                    if (typeof(value) == 'string') {
                        value = parseFloat(value)
                    }
                    td_value = value.toFixed(field.digits);
                }
                break;
            default:
                td_value = value ? value : '';
                break;
        }
    } catch (e) {
        e;

        return '';
    }
    return td_value;
};

AutoForm.addInputType("table", {
    template: "afTable",
    valueOut: function() {
        var name = this.data("schemaKey");
        return SteedosTable.getValidValue(name);
    },
    valueConverters: {
        "stringArray": AutoForm.valueConverters.stringToStringArray,
        "number": AutoForm.valueConverters.stringToNumber,
        "numerArray": AutoForm.valueConverters.stringToNumberArray,
        "boolean": AutoForm.valueConverters.stringToBoolean,
        "booleanArray": AutoForm.valueConverters.stringToBooleanArray,
        "date": AutoForm.valueConverters.stringToDate,
        "dateArray": AutoForm.valueConverters.stringToDateArray
    },
    contextAdjust: function(context) {
        if (typeof context.atts.maxlength === 'undefined' && typeof context.max === 'number') {
            context.atts.maxlength = context.max;
        }
        return context;
    }
});

Template.afTable.events({
    'click .steedos-table .steedosTable-item-add': function(event, template) {

        var name = template.data.name;

        var tableValue = SteedosTable.getTableValue(name);

        var new_item_index = tableValue ? tableValue.length : 0;

        SteedosTable.showModal(name, new_item_index, "add");
    },

    'click .steedos-table .steedosTable-item-field': function(event, template) {
        if (template.data.atts.editable) {
            var field = template.data.name;
            var index = event.currentTarget.dataset.index;
            SteedosTable.showModal(field, index, "edit");
        }
    },

    'click .steedos-table .steedosTable-item-remove': function(event, template) {
        var field = template.data.name;
        var item_index = event.currentTarget.dataset.index;
        Session.set("instance_change", true);
        SteedosTable.removeItem(field, item_index);
    }
});



Template.afTable.rendered = function() {

    var field = this.data.name;

    var keys = SteedosTable.getKeys(field);
    var validValue = SteedosTable.handleData(field, this.data.value);
    SteedosTable.setTableValue(field, validValue);

    $("thead[name='" + field + "Thead']").html(SteedosTable.getThead(field, this.data.atts.editable));

    $("tbody[name='" + field + "Tbody']").html(SteedosTable.getTbody(keys, field, SteedosTable.getTableValue(field), this.data.atts.editable));
};