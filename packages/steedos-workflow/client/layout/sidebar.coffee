Template.workflowSidebar.helpers

	spaceId: ->
		return Steedos.getSpaceId()

	boxName: ->
		if Session.get("box")
			return t(Session.get("box"))

	boxActive: (box)->
		if box == Session.get("box")
			return "active"

Template.workflowSidebar.events

	'click .instance_new': (event, template)->
		#判断是否为欠费工作区
		if WorkflowManager.isArrearageSpace()
			toastr.error(t("spaces_isarrearageSpace"))
			return;

		Modal.show("flow_list_box_modal")

	'click .main-header .logo': (event) ->
		Modal.show "app_list_box_modal"