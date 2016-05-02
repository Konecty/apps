workflowRoutes = FlowRouter.group 
	prefix: '/workflow',
	name: 'workflow',
	triggersEnter: [
		(context, redirect) ->
			#console.log('running workflow triggers');
			if !Meteor.userId()
				redirect('/sign-in');

	]



workflowRoutes.route '/inbox', 
	action: (params, queryParams)->
		BlazeLayout.render 'masterLayout',
			main: "workflow_main"


workflowRoutes.route '/:box/:spaceId', 
	action: (params, queryParams)->
		Session.set("spaceId", params.spaceId);
		Session.set("box", params.box);
		Session.set("flowId", undefined);
		Session.set("instanceId", null); 
		BlazeLayout.render 'masterLayout',
			main: "workflow_main"
		
		$(".instance-wrapper").hide();
		$(".instance-list-wrapper").show();

workflowRoutes.route '/:box/:spaceId/:instanceId', 
	action: (params, queryParams)->

		Session.set("spaceId", params.spaceId);
		Session.set("instanceId", null);

		console.log "call get_instance_data"
		$(document.body).addClass "loading";
		WorkflowManager.callInstanceDataMethod params.instanceId, ()->
			console.log "response get_instance_data" 

			Session.set("instanceId", params.instanceId);
			Session.set("box", params.box);
			BlazeLayout.render 'masterLayout',
				main: "workflow_main"

			if (Steedos.isMobile())
				$(".instance-wrapper").show();
				$(".instance-list-wrapper").hide();
			else
				$(".instance-wrapper").show();
				$(".instance-list-wrapper").show();

			$(document.body).removeClass "loading";


	triggersExit: [
		()->
			Session.set("instanceId", null)
	]
