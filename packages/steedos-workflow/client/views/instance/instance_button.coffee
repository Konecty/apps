Template.instance_button.helpers

	enabled_save: ->
		ins = WorkflowManager.getInstance();
		if !ins
			return false
		flow = db.flows.findOne(ins.flow);
		if !flow
			return false

		if InstanceManager.isInbox()
			return true

		if !ApproveManager.isReadOnly()
			return true
		else
			return false

	enabled_delete: ->
		ins = WorkflowManager.getInstance();
		if !ins
			return false
		space = db.spaces.findOne(ins.space);
		if !space
			return false
		fl = db.flows.findOne({'_id': ins.flow});
		if !fl
			return false
		curSpaceUser = db.space_users.findOne({space: ins.space, 'user': Meteor.userId()});
		if !curSpaceUser
			return false
		organizations = db.organizations.find({_id: {$in: curSpaceUser.organizations}}).fetch();
		if !organizations
			return false

		if Session.get("box") == "draft" || (Session.get("box") == "monitor" && space.admins.contains(Meteor.userId())) || (Session.get("box") == "monitor" && WorkflowManager.canAdmin(fl, curSpaceUser, organizations))
			return true
		else
			return false

	enabled_print: ->
#		如果是手机版APP，则不显示打印按钮
		if Meteor.isCordova
			return false
		return true


	enabled_add_attachment: ->
		if !ApproveManager.isReadOnly()
			return true
		else
			return false

	enabled_terminate: ->
		ins = WorkflowManager.getInstance();
		if !ins
			return false
		if (Session.get("box") == "pending" || Session.get("box") == "inbox") && ins.state == "pending" && ins.applicant == Meteor.userId()
			return true
		else
			return false

	enabled_reassign: ->
		ins = WorkflowManager.getInstance();
		if !ins
			return false
		space = db.spaces.findOne(ins.space);
		if !space
			return false
		fl = db.flows.findOne({'_id': ins.flow});
		if !fl
			return false
		curSpaceUser = db.space_users.findOne({space: ins.space, 'user': Meteor.userId()});
		if !curSpaceUser
			return false
		organizations = db.organizations.find({_id: {$in: curSpaceUser.organizations}}).fetch();
		if !organizations
			return false

		if Session.get("box") == "monitor" && ins.state == "pending" && (space.admins.contains(Meteor.userId()) || WorkflowManager.canAdmin(fl, curSpaceUser, organizations))
			return true
		else
			return false

	enabled_relocate: ->
		ins = WorkflowManager.getInstance();
		if !ins
			return false
		space = db.spaces.findOne(ins.space);
		if !space
			return false
		fl = db.flows.findOne({'_id': ins.flow});
		if !fl
			return false
		curSpaceUser = db.space_users.findOne({space: ins.space, 'user': Meteor.userId()});
		if !curSpaceUser
			return false
		organizations = db.organizations.find({_id: {$in: curSpaceUser.organizations}}).fetch();
		if !organizations
			return false

		if Session.get("box") == "monitor" && ins.state == "pending" && (space.admins.contains(Meteor.userId()) || WorkflowManager.canAdmin(fl, curSpaceUser, organizations))
			return true
		else
			return false

	enabled_cc: ->
		if InstanceManager.isInbox()
			return true
		else
			return false

	enabled_forward: ->
		is_paid = WorkflowManager.isPaidSpace(Session.get('spaceId'));
		if is_paid
			ins = WorkflowManager.getInstance()
			if !ins
				return false

			if ins.state != "draft"
				return true
			else
				return false
		else
			return false

	enabled_retrieve: ->
		ins = WorkflowManager.getInstance()
		if !ins
			return false

		if (Session.get('box') is 'outbox' or Session.get('box') is 'pending') and ins.state is 'pending'
			last_trace = _.find(ins.traces, (t)->
				return t.is_finished is false
			)
			previous_trace_id = last_trace.previous_trace_ids[0];
			previous_trace = _.find(ins.traces, (t)->
				return t._id is previous_trace_id
			)
			# 校验取回步骤的前一个步骤approve唯一并且处理人是当前用户
			previous_trace_approves = previous_trace.approves
			if previous_trace_approves.length is 1 and previous_trace_approves[0].user is Meteor.userId()
				return true
		return false

	enabled_traces: ->
		if Session.get("box") == "draft"
			return false
		else
			return true

Template.instance_button.events

	'click #instance_to_print': (event)->
		uobj = {}
		uobj["box"] = Session.get("box")
		uobj["X-User-Id"] = Meteor.userId()
		uobj["X-Auth-Token"] = Accounts._storedLoginToken()
		Steedos.openWindow(Meteor.absoluteUrl("workflow/space/" + Session.get("spaceId") + "/print/" + Session.get("instanceId") + "?" + $.param(uobj)))

	'click #instance_update': (event)->
		InstanceManager.saveIns();
		Session.set("instance_change", false);

	'click #instance_remove': (event)->
		swal {
			title: t("Are you sure?"),
			type: "warning",
			showCancelButton: true,
			cancelButtonText: t('Cancel'),
			confirmButtonColor: "#DD6B55",
			confirmButtonText: t('OK'),
			closeOnConfirm: true
		}, () ->
			Session.set("instance_change", false);
			InstanceManager.deleteIns()

# <<<<<<< HEAD
# =======
# 	'click #instance_submit': (event)->
# 		if WorkflowManager.isArrearageSpace()
# 			ins = WorkflowManager.getInstance();
# 			if ins.state == "draft"
# 				toastr.error(t("spaces_isarrearageSpace"));
# 				return
# 		if !ApproveManager.isReadOnly()
# 			InstanceManager.checkFormValue();
# 		if($(".has-error").length == 0)
# 			Session.set("instance_change", false);
# 			InstanceManager.submitIns();

# >>>>>>> refs/remotes/origin/master
	'click #instance_force_end': (event)->
		swal {
			title: t("instance_cancel_title"),
			text: t("instance_cancel_reason"),
			type: "input",
			confirmButtonText: t('OK'),
			cancelButtonText: t('Cancel'),
			showCancelButton: true,
			closeOnConfirm: false
		}, (reason) ->
			# 用户选择取消
			if (reason == false)
				return false;

			if (reason == "")
				swal.showInputError(t("instance_cancel_error_reason_required"));
				return false;

			InstanceManager.terminateIns(reason);
			sweetAlert.close();

	'click #instance_reassign': (event, template) ->
		Modal.show('reassign_modal')

	'click #instance_relocate': (event, template) ->
		Modal.show('relocate_modal')


	'click #instance_cc': (event, template) ->
		Modal.show('instance_cc_modal');

	'click #instance_forward': (event, template) ->
		#判断是否为欠费工作区
		if WorkflowManager.isArrearageSpace()
			toastr.error(t("spaces_isarrearageSpace"));
			return;

		Modal.show("forward_select_flow_modal")

	'click #instance_retrieve': (event, template) ->
		swal {
			title: t("instance_retrieve"),
			text: t("instance_retrieve_reason"),
			type: "input",
			confirmButtonText: t('OK'),
			cancelButtonText: t('Cancel'),
			showCancelButton: true,
			closeOnConfirm: false
		}, (reason) ->
			# 用户选择取消
			if (reason == false)
				return false;

			if (reason == "")
				swal.showInputError(t("instance_retrieve_reason"));
				return false;

			InstanceManager.retrieveIns(reason);
			sweetAlert.close();

	'click .btn-trace-list': (event, template) ->
		$(".instance").scrollTop($(".instance .instance-form").height())